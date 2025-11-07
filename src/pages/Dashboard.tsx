import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import useAuthStore from '@/stores/auth.store'
import useDataStore from '@/stores/data.store'
import { Calendar, Clock, ShieldAlert, ShieldCheck } from 'lucide-react'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { scales, military, notifications } = useDataStore()

  const userScales = scales.filter((scale) =>
    user?.associatedScales.includes(scale.id),
  )

  const userServices = scales
    .flatMap((scale) =>
      scale.services.map((service) => ({ ...service, scaleName: scale.name })),
    )
    .filter(
      (service) =>
        service.militaryId === user?.id && service.date >= new Date(),
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)

  const chartData = military.map((m) => ({
    name: m.name.split(' ')[0],
    servicos: scales
      .flatMap((s) => s.services)
      .filter((srv) => srv.militaryId === m.id).length,
  }))

  const getNotificationIcon = (type: 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'info':
        return <ShieldCheck className="h-5 w-5 text-blue-500" />
      case 'warning':
        return <ShieldAlert className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <ShieldAlert className="h-5 w-5 text-red-500" />
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Escalas Ativas</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userScales.map((scale) => (
            <Card
              key={scale.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck /> {scale.name}
                </CardTitle>
                <CardDescription>{scale.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Próximo Serviço:</strong>{' '}
                  {format(
                    new Date(scale.services[0]?.date),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR },
                  )}
                </p>
                <p>
                  <strong>Militares na escala:</strong>{' '}
                  {scale.associatedMilitaryIds.length}
                </p>
                <Button asChild className="w-full mt-4">
                  <Link to={`/scales/${scale.id}`}>Ver Escala</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Meus Próximos Serviços
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              {userServices.length > 0 ? (
                userServices.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{service.scaleName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(service.date),
                            "EEEE, dd 'de' MMMM",
                            { locale: ptBR },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(service.date), 'HH:mm', {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum serviço agendado.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Notificações Recentes</h2>
          <Card>
            <CardContent className="pt-6 space-y-3">
              {notifications.slice(0, 4).map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-secondary"
                >
                  {getNotificationIcon(notif.type)}
                  <div>
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notif.createdAt), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Resumo de "Quadrinhos" (Mês Atual)
        </h2>
        <Card>
          <CardContent className="pt-6">
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="servicos"
                    fill="hsl(var(--primary))"
                    radius={4}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
