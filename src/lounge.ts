import fetch from "node-fetch";
async function get_event(n: number) {
  type req_type = {
    content: {
      feeds: {
        feed: {
          title: string;
        };
        feedId: number;
        feedLink: {
          pc: string;
        };
        gameCompanyEvent?: any;
      }[];
    };
  };
  const feeds = (
    (await (
      await fetch(
        `https://comm-api.game.naver.com/nng_main/v1/community/lounge/Trickcal/feed?boardId=13&limit=${n}&offset=0&order=NEW`
      )
    ).json()) as req_type
  ).content.feeds;
  return feeds.map((e) => ({
    title: e.feed.title,
    id: e.feedId,
    link: e.feedLink.pc,
    is_progress: "gameCompanyEvent" in e,
  }));
}

export { get_event };
