import { useState } from 'react'
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
  Plus,
  Sparkles,
  Trash2,
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

export default function ScaleDetailsPage() {
  const { scaleId } = useParams<{ scaleId: string }>()
  const {
    scales,
    military,
    unavailabilities,
    updateServiceForDay,
    updateReservationForDay,
  } = useDataStore()
  const scale = scales.find((s) => s.id === scaleId)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false)

  const [serviceMilitaryId, setServiceMilitaryId] = useState<string | null>(
    null,
  )
  const [serviceObservations, setServiceObservations] = useState('')
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
    if ((month === 11 && day === 25) || (month === 0 && day === 1))
      return 'text-special'
    if (isWeekend(date)) return 'text-destructive'
    return 'text-foreground'
  }

  const handleDayClick = (day: Date) => {
    setSelectedDay(day)
    const service = scale.services.find((s) => isSameDay(s.date, day))
    const reservation = scale.reservations.find((r) => isSameDay(r.date, day))
    setServiceMilitaryId(service?.militaryId || null)
    setServiceObservations(service?.observations || '')
    setReservationMilitaryIds(reservation?.militaryIds || [])
    setIsDayDialogOpen(true)
  }

  const handleSaveChanges = () => {
    if (!selectedDay) return
    updateServiceForDay(
      scale.id,
      selectedDay,
      serviceMilitaryId,
      serviceObservations,
    )
    updateReservationForDay(scale.id, selectedDay, reservationMilitaryIds)
    toast({ title: 'Serviço atualizado com sucesso!' })
    setIsDayDialogOpen(false)
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
                    className="border-r border-b h-32 bg-muted/50"
                  />
                ))}
                {daysInMonth.map((day) => {
                  const service = scale.services.find((s) =>
                    isSameDay(new Date(s.date), day),
                  )
                  const militaryOnService = service
                    ? getMilitaryById(service.militaryId)
                    : null
                  const reservation = scale.reservations.find((r) =>
                    isSameDay(new Date(r.date), day),
                  )
                  const isUnav = militaryOnService
                    ? isUnavailable(militaryOnService.id, day)
                    : false

                  return (
                    <div
                      key={day.toString()}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        'border-r border-b p-2 h-32 flex flex-col cursor-pointer hover:bg-accent transition-colors',
                        !isSameMonth(day, currentDate) && 'bg-muted/50',
                      )}
                    >
                      <span
                        className={cn('font-bold self-end', getDayColor(day))}
                      >
                        {format(day, 'd')}
                      </span>
                      {militaryOnService && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-center justify-center flex-grow text-center">
                                <Avatar className="h-8 w-8 mb-1">
                                  <AvatarImage
                                    src={militaryOnService.avatarUrl}
                                  />
                                  <AvatarFallback>
                                    {getInitials(militaryOnService.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-xs font-medium truncate w-full">
                                  {militaryOnService.name}
                                </p>
                                <div className="flex gap-1 mt-1">
                                  {reservation && (
                                    <Users className="h-3 w-3 text-blue-500" />
                                  )}
                                  {isUnav && (
                                    <Info className="h-3 w-3 text-yellow-500" />
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isUnav && <p>Militar indisponível!</p>}
                              {reservation && (
                                <p>
                                  {reservation.militaryIds.length} na reserva.
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
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
              <CardTitle>Contagem de "Quadrinhos"</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scale.associatedMilitaryIds.map((id) => {
                  const m = getMilitaryById(id)
                  if (!m) return null
                  const serviceCount = scale.services.filter(
                    (s) =>
                      s.militaryId === id &&
                      isSameMonth(new Date(s.date), currentDate),
                  ).length
                  return (
                    <div key={id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={m.avatarUrl} />
                          <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
                        </Avatar>
                        <span>{m.name}</span>
                      </div>
                      <span className="font-bold text-lg">{serviceCount}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isDayDialogOpen} onOpenChange={setIsDayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editar Serviço -{' '}
              {selectedDay &&
                format(selectedDay, "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Serviço Principal</Label>
              <Select
                value={serviceMilitaryId || ''}
                onValueChange={(value) => setServiceMilitaryId(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um militar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {military.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações do dia."
                value={serviceObservations}
                onChange={(e) => setServiceObservations(e.target.value)}
              />
            </div>
            <div>
              <Label>Reservas do Dia</Label>
              <div className="space-y-2">
                {reservationMilitaryIds.map((id) => {
                  const m = getMilitaryById(id)
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between bg-secondary p-2 rounded-md"
                    >
                      <span>{m?.name}</span>
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
                  onValueChange={(value) => {
                    if (value && !reservationMilitaryIds.includes(value)) {
                      setReservationMilitaryIds((prev) => [...prev, value])
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar militar à reserva" />
                  </SelectTrigger>
                  <SelectContent>
                    {military
                      .filter((m) => !reservationMilitaryIds.includes(m.id))
                      .map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
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
