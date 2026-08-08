import { SEED_ACCOUNTS, SEED_ITINERARIES } from "./data"

async function check(url: string) {
  try {
    const r = await fetch(url, { method: "GET", redirect: "follow" })
    return `${r.status}`
  } catch (e) {
    return `ERR ${e instanceof Error ? e.message : e}`
  }
}

async function main() {
  for (const a of SEED_ACCOUNTS) {
    console.log("avatar", a.username, await check(a.avatar))
  }
  for (const i of SEED_ITINERARIES) {
    console.log("cover", i.key, await check(i.mainImage))
  }
}

main()
