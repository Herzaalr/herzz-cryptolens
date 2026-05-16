export type RssSource = {
  name: string;
  url: string;
  weight: number; // editor pick threshold (impact >= weight = pick)
};

export const RSS_SOURCES: RssSource[] = [
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/", weight: 4 },
  { name: "Cointelegraph", url: "https://cointelegraph.com/rss", weight: 4 },
  { name: "Decrypt", url: "https://decrypt.co/feed", weight: 4 },
  { name: "The Block", url: "https://www.theblock.co/rss.xml", weight: 4 },
  { name: "Bankless", url: "https://newsletter.banklesshq.com/feed", weight: 3 },
  { name: "BeInCrypto", url: "https://beincrypto.com/feed/", weight: 4 },
];
