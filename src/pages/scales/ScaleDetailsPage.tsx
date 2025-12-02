import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useDataStore from '@/stores/data.store'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, isSameDay, addDays, startOfMonth, endOfMonth } from 'date-fns'
import { Save, Printer, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function ScaleDetailsPage() {
  const { scaleId } = useParams()
  const {
    scales,
    military,
    updateServicesForDay,
    unavailabilities,
    unavailabilityTypes,
  } = useDataStore()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedMilitaryId, setSelectedMilitaryId] = useState<string>('')
  const { toast } = useToast()

  const scale = scales.find((s) => s.id === scaleId)

  // Helper to get type name
  const getTypeName = (id: string) => {
    return unavailabilityTypes.find((t) => t.id === id)?.name || 'Unknown'
  }

  useEffect(() => {
    if (scale && selectedDate) {
      const service = scale.services.find((s) =>
        isSameDay(s.date, selectedDate),
      )
      if (service) {
        setSelectedMilitaryId(service.militaryId)
      } else {
        setSelectedMilitaryId('')
      }
    }
  }, [selectedDate, scale])

  if (!scale) {
    return <div>Scale not found</div>
  }

  const associatedMilitary = military.filter((m) =>
    scale.associatedMilitaryIds.includes(m.id),
  )

  const handleSaveDay = async () => {
    if (!selectedDate) return

    if (selectedMilitaryId) {
      await updateServicesForDay(scale.id, selectedDate, [
        {
          militaryId: selectedMilitaryId,
          startTime: '08:00',
          endTime: '08:00', // Next day usually, simplified for now
        },
      ])
      toast({ title: 'Service saved' })
    } else {
      // Clear service
      await updateServicesForDay(scale.id, selectedDate, [])
      toast({ title: 'Service cleared' })
    }
  }

  // Get unavailabilities for selected date
  const activeUnavailabilities = unavailabilities.filter((u) => {
    if (!selectedDate) return false
    return (
      selectedDate >= u.startDate &&
      selectedDate <= u.endDate &&
      scale.associatedMilitaryIds.includes(u.militaryId)
    )
  })

  const isMilitaryUnavailable = (mId: string) => {
    return activeUnavailabilities.some((u) => u.militaryId === mId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{scale.name}</h1>
          <p className="text-muted-foreground">{scale.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              components={{
                day: ({ date, displayMonth }) => {
                  const service = scale.services.find((s) =>
                    isSameDay(s.date, date),
                  )
                  const hasService = !!service
                  return (
                    <div
                      className={cn(
                        'relative flex h-9 w-9 items-center justify-center rounded-md p-0 text-sm font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                        hasService &&
                          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                        date.toDateString() === selectedDate?.toDateString() &&
                          'ring-2 ring-ring ring-offset-2',
                      )}
                      onClick={() => setSelectedDate(date)}
                    >
                      {date.getDate()}
                    </div>
                  )
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Service for {selectedDate ? format(selectedDate, 'PPPP') : '...'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Military</label>
              <Select
                value={selectedMilitaryId}
                onValueChange={setSelectedMilitaryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a military" />
                </SelectTrigger>
                <SelectContent>
                  {associatedMilitary.map((m) => {
                    const unavailable = isMilitaryUnavailable(m.id)
                    return (
                      <SelectItem
                        key={m.id}
                        value={m.id}
                        disabled={unavailable}
                        className={cn(unavailable && 'text-muted-foreground')}
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>
                            {m.rank} {m.name}
                          </span>
                          {unavailable && (
                            <span className="text-xs text-destructive">
                              (Unavailable)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {activeUnavailabilities.length > 0 && (
              <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                <div className="mb-2 flex items-center font-medium">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Unavailabilities Today
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {activeUnavailabilities.map((u) => {
                    const m = military.find((mil) => mil.id === u.militaryId)
                    return (
                      <li key={u.id}>
                        {m?.rank} {m?.name}:{' '}
                        {getTypeName(u.unavailabilityTypeId)}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            <Button onClick={handleSaveDay} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Service
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Month Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Service</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 30 }).map((_, i) => {
                const date = selectedDate
                  ? addDays(startOfMonth(selectedDate), i)
                  : new Date()
                if (date.getMonth() !== selectedDate?.getMonth()) return null
                const service = scale.services.find((s) =>
                  isSameDay(s.date, date),
                )
                const m = service
                  ? military.find((mil) => mil.id === service.militaryId)
                  : null

                return (
                  <TableRow key={i}>
                    <TableCell>{format(date, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(date, 'EEEE')}</TableCell>
                    <TableCell>
                      {m ? (
                        <span className="font-medium">
                          {m.rank} {m.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
