import Sdks,{TSDKUtils} from './sdk'

export { default as FullView } from './components/layout/full-view';
export {default as GlobalToast} from './components/global-toast'
export { default as Toast } from './components/toast-view'

type SDKType = {
  utils: TSDKUtils
}

const Sdk:SDKType = {
  utils: Sdks
}

export default Sdk