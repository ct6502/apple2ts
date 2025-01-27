import Joyride, { ACTIONS, CallBackProps, Step } from 'react-joyride'
import { useGlobalContext } from '../globalcontext'
import { tourMain } from './tourmain'
import { tourSettings } from './toursettings'
import { tourDebug } from './tourdebug'

const RunTour = () => {
  const { runTour: runTour, setRunTour: setRunTour } = useGlobalContext()

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action } = data
    if (action === ACTIONS.RESET || action === ACTIONS.CLOSE) {
      setRunTour('')
      // If our URL contains the "tour" parameter, be sure to turn it off
      // and reload the page. Otherwise if the user saves that URL or
      // posts it, then the tour will run every time the page is loaded.
      const params = new URLSearchParams(window.location.search.toLowerCase())
      if (params.get('tour')) {
        // Remove the 'tour' parameter      
        const url = new URL(window.location.href)
        url.searchParams.delete('tour')
        // Reload the page with the updated URL
        window.location.href = url.toString()
      }
    }
  }

  let tour: Step[] = []

  switch (runTour.toLowerCase()) {
    case 'main':
      tour = tourMain
      break
    case 'debug':
      tour = tourDebug
      break
    case 'settings':
      tour = tourSettings
      break
    default:
      break
  }

  const locale = {
    back: 'Back',
    close: 'Close',
    last: 'Finish',
    next: 'Next',
    skip: 'Close',
  }

  return (
    <Joyride
      callback={handleJoyrideCallback}
      steps={tour}
      locale={locale}
      run={tour.length > 0}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      spotlightClicks={true}
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
    />
  )

}

export default RunTour
