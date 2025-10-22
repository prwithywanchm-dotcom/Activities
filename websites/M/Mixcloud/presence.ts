import { Assets /* , Presence */ } from 'premid'
// import type { PresenceData } from 'premid' // ถ้าแพ็กเกจมี type นี้

const presence = new Presence({ clientId: '610102236374368267' })
const stringsPromise = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
})

presence.on('UpdateData', async () => {
  const hasPlayer = document.querySelector("[class^='PlayerControls__PlayerContainer']")
  if (!hasPlayer) {
    presence.setActivity() // clear
    return
  }

  const normalIsPlaying =
    document.querySelector("div[class^='PlayButton__PlayerControl']")?.getAttribute('aria-label') === 'Pause'
  const liveIsPlaying =
    document.querySelector("[class^=LiveVideo__VideoContainer] .shaka-play-button")?.getAttribute('icon') === 'pause'
  const isPlaying = !!(normalIsPlaying || liveIsPlaying)

  let author: string | null = null
  let title: string | null = null
  let url: string | null = null
  let openUrlText: string | null = null

  if (normalIsPlaying) {
    const normalDetails = document.querySelector("[class^='shared__ShowDetails'] > a:nth-child(1)")
    const href = normalDetails?.getAttribute('href') ?? undefined
    title = normalDetails?.textContent?.trim() ?? null
    url = href ? new URL(href, window.location.origin).href : null
    openUrlText = 'Listen to Show'
    author = document.querySelector("[class^='PlayerControls__ShowOwnerName']")?.textContent?.trim() ?? null
  } else if (liveIsPlaying) {
    url = window.location.href
    openUrlText = 'View Livestream'
    title = document
      .querySelector("[class^='LiveStreamDetails__StreamTitleContainer'] > h4")
      ?.textContent?.trim() ?? null
    author = document
      .querySelector("[class^='LiveStreamStreamerDetails__StreamerDetailsTextContainer'] h4")
      ?.textContent?.trim() ?? null
  }

  if (!isPlaying || !title) {
    presence.setActivity() // ไม่เล่น/ไม่มี title ก็เคลียร์
    return
  }

  const s = await stringsPromise

  // ใส่ปุ่มเฉพาะเมื่อครบทั้ง label และ url
  const buttons =
    openUrlText && url ? [{ label: openUrlText, url }] : undefined

  const presenceData /* : PresenceData */ = {
    details: title,
    state: author ?? undefined,
    // แนะนำใช้ asset key ที่อัปโหลดไว้ใน Discord app ของคุณ
    largeImageKey: 'mixcloud_logo',
    smallImageKey: liveIsPlaying ? Assets.Live : (Assets.Play),
    smallImageText: liveIsPlaying ? s.live : s.play,
    ...(buttons ? { buttons } : {}),
  }

  presence.setActivity(presenceData)
})
