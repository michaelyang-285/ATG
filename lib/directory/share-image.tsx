import * as React from "react";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {ImageResponse} from "next/og";
import type {DirectoryCard} from "./share";

const publicRoot = path.join(process.cwd(), "public");
let branding: ReturnType<typeof loadBrand> | undefined;
function loadBrand() {
  return Promise.all([
    readFile(path.join(publicRoot, "fonts", "DMSans-Bold.ttf")),
    readFile(path.join(publicRoot, "fonts", "DMSans-Medium.ttf")),
    readFile(path.join(publicRoot, "brand", "atg-avatar.png")),
    readFile(path.join(publicRoot, "fonts", "be-vietnam-pro", "BeVietnamPro-Bold.ttf")),
    readFile(path.join(publicRoot, "fonts", "be-vietnam-pro", "BeVietnamPro-Medium.ttf")),
  ]);
}

export async function directoryImage(card: DirectoryCard) {
  branding ??= loadBrand().catch(error => { branding = undefined; throw error; });
  const [[bold, medium, avatar, vietnameseBold, vietnameseMedium], art] = await Promise.all([
    branding, readFile(path.join(publicRoot, "directory-art", card.asset + ".jpg")),
  ]);
  // Reserve two lines for the longest names. Keeping the size below 48 in that case
  // leaves room for the service line even when a long word wraps early.
  const singleLineSize = Math.floor(1450 / Math.max(1, Array.from(card.name).length));
  const titleSize = singleLineSize < 45 ? 43 : Math.min(78, singleLineSize);
  const ink = "#FFFCF4";
  return new ImageResponse(
    <div style={{display:"flex", flexDirection:"column", width:1200, height:630,
      backgroundColor:card.background, color:ink, fontFamily:"DM Sans, Be Vietnam Pro"}}>
      <img width={1200} height={400} src={"data:image/jpeg;base64," + art.toString("base64")} />
      <div style={{display:"flex", width:1200, height:230, borderTop:"4px solid "+card.accent,
        padding:"12px 40px 12px 48px", alignItems:"center", justifyContent:"space-between"}}>
        <div style={{display:"flex", flexDirection:"column", width:885, justifyContent:"center"}}>
          <div style={{display:"block", color:card.accent, fontWeight:700, fontSize:25,
            textTransform:"uppercase", lineClamp:1, marginBottom:5}}>
            {`${card.label}   /   ${card.location}`}
          </div>
          <div style={{display:"block", fontSize:titleSize, fontWeight:700, lineHeight:1.04,
            letterSpacing:"-1.5px", wordBreak:"break-word", lineClamp:2}}>{card.name}</div>
          {card.detail && <div style={{display:"block", fontSize:card.detail.length > 49 ? 29 : 34,
            fontWeight:500, lineClamp:1, marginTop:8}}>{card.detail}</div>}
        </div>
        <div style={{display:"flex", flexDirection:"column", width:205, alignItems:"center"}}>
          <img width={86} height={86} src={"data:image/png;base64," + avatar.toString("base64")} />
          <div style={{fontSize:20, fontWeight:700, marginTop:12, whiteSpace:"nowrap"}}>All Things Gwinnett</div>
        </div>
      </div>
    </div>,
    {width:1200, height:630, fonts:[
      {name:"DM Sans",data:bold,weight:700,style:"normal"},
      {name:"DM Sans",data:medium,weight:500,style:"normal"},
      {name:"Be Vietnam Pro",data:vietnameseBold,weight:700,style:"normal"},
      {name:"Be Vietnam Pro",data:vietnameseMedium,weight:500,style:"normal"},
    ],headers:{"Cache-Control":"public, max-age=0, s-maxage=300, stale-while-revalidate=30"}},
  );
}

export async function checkedDirectoryPng(card: DirectoryCard) {
  const png = Buffer.from(await (await directoryImage(card)).arrayBuffer());
  if (png.length < 24 || png.toString("hex", 0, 8) !== "89504e470d0a1a0a" ||
      png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630)
    throw Error("The directory card must be a 1200 × 630 PNG.");
  return png;
}
