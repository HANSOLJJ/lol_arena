// 실행 위치(Discord 액티비티 여부)에 따라 화면을 나누는 최상위 컴포넌트
import { ActivityScreen } from './components/ActivityScreen.tsx'
import { BrowserNotice } from './components/BrowserNotice.tsx'
import { isDiscordLaunch } from './lib/discord.ts'

const inDiscord = isDiscordLaunch()

export default function App() {
  return inDiscord ? <ActivityScreen /> : <BrowserNotice />
}
