import fetch from "node-fetch";
type req_type = {
  content: {
    feeds: {
      feed: {
        title: string;
        contents: string;
      };
      feedId: number;
      feedLink: {
        pc: string;
      };
      gameCompanyEvent?: {
        phase: string;
      };
    }[];
  };
};
function try_again(
  f: (n: number) => Promise<
    {
      title: string;
      id: number;
      link: string;
      is_progress: boolean;
      contents: string;
    }[]
  >
) {
  return async (n: number) => {
    try {
      return await f(n);
    } catch {
      return try_again(f)(n);
    }
  };
}
async function get_event(n: number) {
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
    is_progress:
      "gameCompanyEvent" in e && e.gameCompanyEvent?.phase === "IN_PROGRESS",
    contents: e.feed.contents,
  }));
}
async function get_ticket(n: number) {
  let feeds_ = (await (
    await fetch(
      `https://comm-api.game.naver.com/nng_main/v1/community/lounge/Trickcal/feed?boardId=31&limit=${n}&offset=0&order=NEW`
    )
  ).json()) as req_type;
  const feeds = feeds_.content.feeds;
  return feeds.map((e) => ({
    title: e.feed.title,
    id: e.feedId,
    link: e.feedLink.pc,
    is_progress: "gameCompanyEvent" in e,
    contents: e.feed.contents,
  }));
}
const t_event = try_again(get_event);
const t_ticket = try_again(get_ticket);
export { t_event as get_event, t_ticket as get_ticket };
