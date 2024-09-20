import { globalShortcut } from 'electron'

export const useDisableButton = () =>{
  const disableF12 = ()=>{
    globalShortcut.register('f12', () => {
      console.log('The user attempted to launch the console')
    })
  }
  return{
    disableF12
  }
}

