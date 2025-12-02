import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  format,
  getDaysInMonth,
  startOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  isWeekend,
  isSameMonth,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Info,
  Sparkles,
  Trash2,
  Plus,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useDataStore from '@/stores/data.store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AssignmentState {
  id?: string
  militaryId: string
  startTime: string
  endTime: string
  observations: string
}

export default function ScaleDetailsPage() {
  const { scaleId } = useParams<{ scaleId: string }>()
  const {
    scales,
    military,
    unavailabilities,
    updateServicesForDay,
    updateReservationForDay,
  } = useDataStore()
  const scale = scales.find((s) => s.id === scaleId)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false)

  // Local state for editing services/reservations
  const [currentAssignments, setCurrentAssignments] = useState<
    AssignmentState[]
  >([])
  const [reservationMilitaryIds, setReservationMilitaryIds] = useState<
    string[]
  >([])

  if (!scale) return <div>Escala não encontrada.</div>

  const firstDayOfMonth = startOfMonth(currentDate)
  const daysInMonth = Array.from(
    { length: getDaysInMonth(currentDate) },
    (_, i) =>
      new Date(
        firstDayOfMonth.getFullYear(),
        firstDayOfMonth.getMonth(),
        i + 1,
      ),
  )
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const getMilitaryById = (id: string) => military.find((m) => m.id === id)
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  const isUnavailable = (militaryId: string, date: Date) => {
    return unavailabilities.some(
      (u) =>
        u.militaryId === militaryId && date >= u.startDate && date <= u.endDate,
    )
  }

  const getDayColor = (date: Date) => {
    const day = date.getDate()
    const month = date.getMonth()
    // Month is 0-indexed
    if ((month === 11 && day === 25) || (month === 0 && day === 1))
      return 'text-special'
    if (isWeekend(date)) return 'text-destructive'
    return 'text-foreground'
  }

  const handleDayClick = (day: Date) => {
    setSelectedDay(day)
    const services = scale.services.filter((s) => isSameDay(s.date, day))
    const reservation = scale.reservations.find((r) => isSameDay(r.date, day))

    const assignments = services.map((s) => ({
      id: s.id,
      militaryId: s.militaryId,
      startTime: s.startTime || '08:00',
      endTime: s.endTime || '08:00',
      observations: s.observations || '',
    }))

    setCurrentAssignments(assignments)
    setReservationMilitaryIds(reservation?.militaryIds || [])
    setIsDayDialogOpen(true)
  }

  const handleSaveChanges = () => {
    if (!selectedDay) return

    const servicesToSave = currentAssignments.map((a) => ({
      militaryId: a.militaryId,
      startTime: a.startTime,
      endTime: a.endTime,
      observations: a.observations,
    }))

    updateServicesForDay(scale.id, selectedDay, servicesToSave)
    updateReservationForDay(scale.id, selectedDay, reservationMilitaryIds)

    toast({ title: 'Escala do dia atualizada com sucesso!' })
    setIsDayDialogOpen(false)
  }

  const addAssignment = () => {
    setCurrentAssignments([
      ...currentAssignments,
      {
        militaryId: '',
        startTime: '08:00',
        endTime: '20:00',
        observations: '',
      },
    ])
  }

  const removeAssignment = (index: number) => {
    const newAssignments = [...currentAssignments]
    newAssignments.splice(index, 1)
    setCurrentAssignments(newAssignments)
  }

  const updateAssignment = (
    index: number,
    field: keyof AssignmentState,
    value: string,
  ) => {
    const newAssignments = [...currentAssignments]
    newAssignments[index] = { ...newAssignments[index], [field]: value }
    setCurrentAssignments(newAssignments)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{scale.name}</h1>
          <p className="text-muted-foreground">{scale.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar Escala Automática
          </Button>
          <div className="flex items-center gap-2 rounded-md border p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="w-32 text-center font-medium capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-2">
              <div className="grid grid-cols-7 text-center font-semibold text-sm text-muted-foreground">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(
                  (day) => (
                    <div key={day} className="py-2">
                      {day}
                    </div>
                  ),
                )}
              </div>
              <div className="grid grid-cols-7 border-t border-l">
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="border-r border-b h-36 bg-muted/50"
                  />
                ))}
                {daysInMonth.map((day) => {
                  const dayServices = scale.services.filter((s) =>
                    isSameDay(new Date(s.date), day),
                  )
                  const reservation = scale.reservations.find((r) =>
                    isSameDay(new Date(r.date), day),
                  )

                  return (
                    <div
                      key={day.toString()}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        'border-r border-b p-2 h-36 flex flex-col cursor-pointer hover:bg-accent transition-colors group relative overflow-hidden',
                        !isSameMonth(day, currentDate) && 'bg-muted/50',
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn('font-bold', getDayColor(day))}>
                          {format(day, 'd')}
                        </span>
                        <div className="flex gap-1">
                          {reservation && (
                            <Users className="h-3 w-3 text-blue-500" />
                          )}
                        </div>
                      </div>

                      <div className="flex-grow overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-300">
                        {dayServices.map((service, idx) => {
                          const m = getMilitaryById(service.militaryId)
                          if (!m) return null
                          const isUnav = isUnavailable(m.id, day)
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 bg-background/80 p-1 rounded border text-xs"
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={m.avatarUrl} />
                                <AvatarFallback className="text-[8px]">
                                  {getInitials(m.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="truncate font-medium leading-tight">
                                  {m.name}
                                </span>
                                <span className="text-[9px] text-muted-foreground leading-tight">
                                  {service.startTime} - {service.endTime}
                                </span>
                              </div>
                              {isUnav && (
                                <Info className="h-3 w-3 text-yellow-500 ml-auto shrink-0" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Contagem de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3 pr-4">
                  {scale.associatedMilitaryIds.map((id) => {
                    const m = getMilitaryById(id)
                    if (!m) return null
                    const serviceCount = scale.services.filter(
                      (s) =>
                        s.militaryId === id &&
                        isSameMonth(new Date(s.date), currentDate),
                    ).length
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={m.avatarUrl} />
                            <AvatarFallback>
                              {getInitials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{m.name}</span>
                        </div>
                        <span className="font-bold text-sm bg-secondary px-2 py-1 rounded-md min-w-[2rem] text-center">
                          {serviceCount}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDayDialogOpen} onOpenChange={setIsDayDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar Escala -{' '}
              {selectedDay &&
                format(selectedDay, "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Militares Escalados
                </Label>
                <Button size="sm" onClick={addAssignment} variant="secondary">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Militar
                </Button>
              </div>

              {currentAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  Nenhum militar escalado para este dia.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentAssignments.map((assignment, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border p-4 rounded-lg bg-card"
                    >
                      <div className="md:col-span-4 space-y-2">
                        <Label>Militar</Label>
                        <Select
                          value={assignment.militaryId}
                          onValueChange={(value) =>
                            updateAssignment(index, 'militaryId', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {scale.associatedMilitaryIds.map((id) => {
                              const m = getMilitaryById(id)
                              return m ? (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.name}
                                </SelectItem>
                              ) : null
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Início
                        </Label>
                        <Input
                          type="time"
                          value={assignment.startTime}
                          onChange={(e) =>
                            updateAssignment(index, 'startTime', e.target.value)
                          }
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Fim
                        </Label>
                        <Input
                          type="time"
                          value={assignment.endTime}
                          onChange={(e) =>
                            updateAssignment(index, 'endTime', e.target.value)
                          }
                        />
                      </div>

                      <div className="md:col-span-3 space-y-2">
                        <Label>Observação (Opcional)</Label>
                        <Input
                          placeholder="Obs..."
                          value={assignment.observations}
                          onChange={(e) =>
                            updateAssignment(
                              index,
                              'observations',
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="md:col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full"
                          onClick={() => removeAssignment(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label className="text-base font-semibold">Reserva</Label>
              <div className="space-y-2">
                {reservationMilitaryIds.map((id) => {
                  const m = getMilitaryById(id)
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between bg-secondary/50 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={m?.avatarUrl} />
                          <AvatarFallback>{m?.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{m?.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          setReservationMilitaryIds((prev) =>
                            prev.filter((mid) => mid !== id),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )
                })}
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !reservationMilitaryIds.includes(value)) {
                      setReservationMilitaryIds((prev) => [...prev, value])
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar à reserva" />
                  </SelectTrigger>
                  <SelectContent>
                    {scale.associatedMilitaryIds
                      .filter((id) => !reservationMilitaryIds.includes(id))
                      .map((id) => {
                        const m = getMilitaryById(id)
                        return m ? (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ) : null
                      })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDayDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
