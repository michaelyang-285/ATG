import { formatDate, type Story } from "@/lib/publication";

const clock = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});

function StoryTime({ value }: { value: string }) {
  const time = clock.format(new Date(value)).replace(/\s*([AP])M$/i, (_, letter: string) => " " + letter.toLowerCase() + ".m.");
  return <time dateTime={value}>{formatDate(value)} at {time}</time>;
}

export function StoryByline({ story }: { story: Story }) {
  const { author, publishedAt, updatedAt } = story;
  return (
    <>
      {author?.name && <>By {author.slug ? <a href={"/authors/" + encodeURIComponent(author.slug)}>{author.name}</a> : author.name}</>}
      {publishedAt && <>{author?.name && " · "}Published <StoryTime value={publishedAt} /></>}
      {updatedAt && <> · Updated <StoryTime value={updatedAt} /></>}
    </>
  );
}
