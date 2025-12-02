import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useDataStore from '@/stores/data.store'
import { format, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plane } from 'lucide-react'

export function MissionsOverview() {
  const { unavailabilities, military, scales } = useDataStore()
  const today = new Date()

  // Filter active missions
  const activeMissions = unavailabilities.filter((u) => {
    if (u.type !== 'Missão') return false
    return isWithinInterval(today, {
      start: new Date(u.startDate),
      end: new Date(u.endDate),
    })
  })

  if (activeMissions.length === 0) {
    return null
  }

  // Group missions by primary scale
  const groupedMissions: Record<
    string,
    {
      militaryName: string
      militaryRank: string
      avatarUrl: string
      startDate: Date
      endDate: Date
    }[]
  > = {}

  activeMissions.forEach((mission) => {
    const militaryPerson = military.find((m) => m.id === mission.militaryId)
    if (!militaryPerson) return

    // Determine primary scale (first one or "Sem Escala")
    let scaleName = 'Sem Escala'
    if (
      militaryPerson.associatedScales &&
      militaryPerson.associatedScales.length > 0
    ) {
      const primaryScaleId = militaryPerson.associatedScales[0]
      const scale = scales.find((s) => s.id === primaryScaleId)
      if (scale) scaleName = scale.name
    }

    if (!groupedMissions[scaleName]) {
      groupedMissions[scaleName] = []
    }

    groupedMissions[scaleName].push({
      militaryName: militaryPerson.name,
      militaryRank: militaryPerson.rank,
      avatarUrl: militaryPerson.avatarUrl,
      startDate: new Date(mission.startDate),
      endDate: new Date(mission.endDate),
    })
  })

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Militares em Missão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedMissions).map(([scaleName, missions]) => (
          <div key={scaleName} className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              {scaleName}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {missions.map((mission, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 rounded-md border p-3 bg-card hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={mission.avatarUrl} />
                    <AvatarFallback>
                      {getInitials(mission.militaryName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {mission.militaryRank} {mission.militaryName}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      {format(mission.startDate, 'dd/MM', {
                        locale: ptBR,
                      })} -{' '}
                      {format(mission.endDate, 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      Em Missão
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
