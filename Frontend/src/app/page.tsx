'use client'
import { sendMessage } from "./utils/twilio"


import dynamic from 'next/dynamic'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle, Info } from 'lucide-react'
import AccidentReportForm from './components/AccidentForm'


const DynamicMap = dynamic(() => import('@/app/components/Map'), {
  ssr: false,
})

export default function Home() {
  const [showForm, setShowForm] = useState(false)
  const [coordinates, setCoordinates] = useState<[number, number]>([27.7172, 85.324])
  const [isSending, setIsSending] = useState(false)
  const [counter, setCounter] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleSOSStart = useCallback(async () => {
    if (isSending) return
    setIsSending(true)
    setCounter(0)
    hasTriggeredRef.current = false

    intervalRef.current = setInterval(async () => {
      setCounter(prev => {
        const newCount = prev + 1
        
        if (!hasTriggeredRef.current) {
          switch(newCount) {
            case 1:
              console.log('Held for 1 second')
              break
            case 2:
              console.log('Held for 2 seconds')
              break
            case 3:
              console.log('Held for 3 seconds')
              break
            case 4:
              console.log('Held for 4 seconds')
              break
            case 5:
              (async () => {
                console.log('SOS Alert Triggered!')
                hasTriggeredRef.current = true
                try {
                  await sendMessage(coordinates[0], coordinates[1])
                  alert('Emergency services have been notified with your location!')
                } catch (error) {
                  console.error('Failed to send SOS:', error)
                  alert('Failed to send SOS! Please try again.')
                } finally {
                  clearInterval(intervalRef.current!)
                  setIsSending(false)
                  setCounter(0)
                }
              })()
              break
          }
        }
        return newCount
      })
    }, 1000)
  }, [isSending, coordinates])

  const handleSOSEnd = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsSending(false)
    setCounter(0)
    hasTriggeredRef.current = false
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Rakshak
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="destructive" onClick={() => setShowForm(true)}>
              Report a hazard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Info className="h-5 w-5" />
              About Rakshak
            </h2>
            <p className="text-muted-foreground">
              Rakshak provides an enhanced map for safer travel by highlighting accident and disaster-prone areas.
              Stay informed and plan your journey with safety in mind.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-4">
            <CardContent className="p-4">
              <DynamicMap onCoordinateChange={setCoordinates} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Button
        variant="destructive"
        className={`fixed bottom-4 right-4 p-6 text-xl font-bold rounded-full transition-all ${
          isSending ? 'bg-red-700' : ''
        }`}
        onMouseDown={handleSOSStart}
        onMouseUp={handleSOSEnd}
        onMouseLeave={handleSOSEnd}
        onTouchStart={handleSOSStart}
        onTouchEnd={handleSOSEnd}
        disabled={counter === 5}
      >
        {isSending ? `Hold (${counter}/5)` : 'SOS'}
      </Button>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px] z-50">
          <DialogHeader>
            <DialogTitle>Report an Accident</DialogTitle>
          </DialogHeader>
          <AccidentReportForm
            onClose={() => setShowForm(false)}
            coordinates={coordinates}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}