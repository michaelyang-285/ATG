"""Check an ATG draft or audit the live metadata of one URL or the whole sitemap."""
import argparse
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from html.parser import HTMLParser
from io import BytesIO
import json
from pathlib import Path
import re
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlencode, urlsplit
from urllib.request import Request, urlopen
from xml.etree import ElementTree

try:
    from PIL import Image
except ImportError:
    sys.exit("Install Pillow in your Python environment to check the decoded share images.")

BASE = "https://allthingsgwinnett.com"
BOT = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
TEXT_FIELDS = ("title", "description", "og:title", "og:description")
FIELDS = (*TEXT_FIELDS, "og:image")
STORY_COPY = {"title": "title", "description": "description", "ogTitle": "og:title", "ogDescription": "og:description"}
MAX_BYTES = 16 * 1024 * 1024


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.values = defaultdict(list)
        self.in_head = self.in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "head":
            self.in_head = True
        if not self.in_head:
            return
        if tag == "title":
            self.in_title = True
            self.values["title"].append("")
        if tag == "meta":
            key = (a.get("name") or a.get("property") or "").lower()
            self.values[key].append((a.get("content") or "").strip())

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "head":
            self.in_head = False

    def handle_data(self, data):
        if self.in_title:
            self.values["title"][-1] += data


def fetch(url):
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={"User-Agent": BOT}), timeout=25) as res:
                body = res.read(MAX_BYTES + 1)
                if len(body) > MAX_BYTES:
                    raise ValueError("response exceeds audit read limit")
                return body, res.headers.get_content_type(), res.geturl()
        except (OSError, URLError) as exc:
            if isinstance(exc, HTTPError) and exc.code not in (408, 429, 500, 502, 503, 504):
                raise
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)


def public_profile_or_story(url):
    u = urlsplit(url)
    return (u.scheme == "https" and u.netloc == "allthingsgwinnett.com"
            and re.fullmatch(r"/(?:stories|directory)/[^/]+", u.path)
            and u.path not in ("/directory/submit", "/directory/manage")
            and not u.query and not u.fragment)


def verify_image(url):
    u = urlsplit(url)
    if u.scheme != "https" or u.hostname not in ("cdn.sanity.io", "allthingsgwinnett.com"):
        raise ValueError("expected a public ATG card or Sanity editorial image")
    body, mime, _ = fetch(url)
    if not mime.startswith("image/"):
        raise ValueError("image URL serves " + mime)
    with Image.open(BytesIO(body)) as img:
        if img.size != (1200, 630):
            raise ValueError(f"image measures {img.width} × {img.height}, expected 1200 × 630")
        img.load()
    return sha256(body).hexdigest()


PLACEHOLDERS = {"untitled", "untitled article", "untitled business", "todo", "tbd",
                "lorem ipsum", "all things gwinnett", "story not found"}


def placeholder(value):
    normalized = value.casefold().strip(" .")
    return (normalized in PLACEHOLDERS
            or re.fullmatch(r"find .+ in the all things gwinnett business directory", normalized) is not None)


def inspect(url):
    values, issues = {}, []
    try:
        html, mime, final = fetch(url)
        if final != url or mime != "text/html":
            raise ValueError(f"expected canonical HTML, got {mime} at {final}")
        head = Head()
        head.feed(html.decode("utf-8"))
        for key in FIELDS:
            found = head.values[key]
            if len(found) != 1 or not found[0].strip():
                issues.append(f"{key}: expected one nonempty value, found {found!r}")
            else:
                values[key] = found[0].strip()
                if key in TEXT_FIELDS and placeholder(values[key]):
                    issues.append(f"{key}: placeholder copy")
        if urlsplit(url).path.startswith("/stories/"):
            slug = unquote(urlsplit(url).path.rsplit("/", 1)[1])
            query = '*[_type == "post" && slug.current == $slug][0]{_type,seo}'
            params = urlencode({"query": query, "$slug": json.dumps(slug), "perspective": "published"})
            raw = fetch("https://xnm5c645.api.sanity.io/v2026-02-01/data/query/production?" + params)[0]
            source, asset_url, source_issues = story_fields(json.loads(raw)["result"])
            issues.extend(source_issues)
            for key, value in source.items():
                if key in values and values[key] != value:
                    issues.append(f"{key}: live copy differs from the published Sanity field")
            if asset_url and urlsplit(values.get("og:image", "")).path != urlsplit(asset_url).path:
                issues.append("og:image: live image differs from the published Sanity share asset")
        image = values.get("og:image")
        if image:
            if "/directory/" in url and urlsplit(image)._replace(query="").geturl() != url + "/share-image":
                issues.append("og:image: expected the profile’s own directory card")
            if urlsplit(image).path == "/brand/og.png":
                issues.append("og:image: generic site cover")
            values["image contents"] = verify_image(image)
    except Exception as exc:
        issues.append(str(exc))
    return url, values, issues


def story_fields(doc):
    if not isinstance(doc, dict) or doc.get("_type") != "post":
        return {}, None, ["Expected a single Sanity post document"]
    seo = doc.get("seo") or {}
    if not isinstance(seo, dict):
        return {}, None, ["Invalid seo object"]
    copy, issues = {}, []
    for name, tag in STORY_COPY.items():
        field = seo.get(name)
        if not isinstance(field, str) or not field.strip():
            issues.append("Missing seo." + name)
        elif placeholder(field):
            issues.append("Placeholder seo." + name)
        else:
            copy[tag] = field.strip()
    image = seo.get("ogImage")
    asset = image.get("asset") if isinstance(image, dict) else None
    ref = asset.get("_ref") if isinstance(asset, dict) else None
    match = re.fullmatch(r"image-([a-zA-Z0-9]+)-(\d+x\d+)-([a-zA-Z0-9]+)", ref or "")
    if not match:
        return copy, None, issues + ["Missing or invalid seo.ogImage.asset._ref"]
    filename = "{}-{}.{}".format(*match.groups())
    return copy, "https://cdn.sanity.io/images/xnm5c645/production/" + filename, issues


def story_draft(path):
    copy, asset_url, issues = story_fields(json.loads(Path(path).read_text(encoding="utf-8")))
    for key, value in copy.items():
        print(f"  {key}: {value}")
    if asset_url:
        url = asset_url + "?w=1200&h=630&fit=crop&fm=jpg"
        print("  og:image:", url)
        verify_image(url)
    return issues


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("urls", nargs="*")
    parser.add_argument("--story-draft", metavar="POST_JSON")
    args = parser.parse_args()
    if args.story_draft:
        if args.urls:
            parser.error("choose a draft or published URLs")
        issues = story_draft(args.story_draft)
        print("\n".join(issues) if issues else "PASS: four editorial fields and a decodable 1200 × 630 article image")
        return bool(issues)
    if args.urls:
        if not all(public_profile_or_story(url) for url in args.urls):
            parser.error("supply production directory or story URLs without query strings")
        urls = sorted(set(args.urls))
    else:
        xml = ElementTree.fromstring(fetch(BASE + "/sitemap.xml")[0])
        urls = sorted({loc.text for loc in xml.findall(".//{*}loc") if public_profile_or_story(loc.text or "")})
        if not all(any(url.startswith(BASE + "/" + kind + "/") for url in urls) for kind in ("directory", "stories")):
            raise ValueError("sitemap did not yield both articles and directory profiles")
    duplicates = defaultdict(list)
    failures = defaultdict(list)
    with ThreadPoolExecutor(max_workers=5) as workers:
        for url, values, issues in workers.map(inspect, urls):
            if issues:
                failures[url].extend(issues)
            for key in (*TEXT_FIELDS, "image contents"):
                if key in values:
                    normalized = " ".join(values[key].casefold().split())
                    duplicates[key, normalized].append(url)
            if args.urls:
                print(url)
                for key in FIELDS:
                    print(f"  {key}: {values.get(key, '(missing)')}")
    for (key, _), pages in duplicates.items():
        if len(pages) > 1:
            for page in pages:
                failures[page].append(f"{key} duplicates another page: {next(p for p in pages if p != page)}")
    for url, issues in sorted(failures.items()):
        print(url + "\n  " + "\n  ".join(issues))
    print(f"{len(urls)} pages checked; {len(failures)} with issues.")
    return bool(failures)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, ElementTree.ParseError) as exc:
        sys.exit("Audit incomplete: " + str(exc))
