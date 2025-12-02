import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Mail, Phone, PlusCircle, Edit, Trash2 } from 'lucide-react'
import useDataStore from '@/stores/data.store'
import { Unavailability } from '@/types'
import { ManageUnavailabilityDialog } from '@/components/ManageUnavailabilityDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function MilitaryProfilePage() {
  const { militaryId } = useParams<{ militaryId: string }>()
  const { military, unavailabilities, scales, deleteUnavailability } =
    useDataStore()
  const person = military.find((m) => m.id === militaryId)
  const personUnavailabilities = unavailabilities.filter(
    (u) => u.militaryId === militaryId,
  )
  const personServices = scales
    .flatMap((scale) =>
      scale.services
        .filter((service) => service.militaryId === militaryId)
        .map((service) => ({ ...service, scaleName: scale.name })),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const [isUnavailabilityDialogOpen, setIsUnavailabilityDialogOpen] =
    useState(false)
  const [editingUnavailability, setEditingUnavailability] = useState<
    Unavailability | undefined
  >(undefined)

  const handleAddUnavailability = () => {
    setEditingUnavailability(undefined)
    setIsUnavailabilityDialogOpen(true)
  }

  const handleEditUnavailability = (unavailability: Unavailability) => {
    setEditingUnavailability(unavailability)
    setIsUnavailabilityDialogOpen(true)
  }

  if (!person) return <div>Militar não encontrado.</div>

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={person.avatarUrl} alt={person.name} />
          <AvatarFallback className="text-3xl">
            {getInitials(person.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{person.name}</h1>
          <p className="text-xl text-muted-foreground">{person.rank}</p>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" /> {person.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-4 w-4" /> {person.phone}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Indisponibilidades</CardTitle>
            <Button size="sm" onClick={handleAddUnavailability}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personUnavailabilities.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.type}</TableCell>
                    <TableCell>
                      {format(new Date(u.startDate), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(u.endDate), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditUnavailability(u)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUnavailability(u.id)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Serviços</CardTitle>
            <CardDescription>
              Lista dos últimos serviços tirados pelo militar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Escala</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personServices.slice(0, 10).map((service, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {format(new Date(service.date), "dd 'de' MMMM, yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      {service.startTime && service.endTime
                        ? `${service.startTime} - ${service.endTime}`
                        : 'Integral'}
                    </TableCell>
                    <TableCell>{service.scaleName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      {isUnavailabilityDialogOpen && (
        <ManageUnavailabilityDialog
          isOpen={isUnavailabilityDialogOpen}
          onOpenChange={setIsUnavailabilityDialogOpen}
          militaryId={person.id}
          unavailability={editingUnavailability}
        />
      )}
    </div>
  )
}
