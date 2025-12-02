import { useParams, Link } from 'react-router-dom'
import useDataStore from '@/stores/data.store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Phone,
  Shield,
  CalendarOff,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
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
import { Unavailability } from '@/types'
import { toast } from '@/components/ui/use-toast'

export default function MilitaryProfilePage() {
  const { militaryId } = useParams<{ militaryId: string }>()
  const { military, scales, unavailabilities, deleteUnavailability } =
    useDataStore()
  const [isUnavailabilityDialogOpen, setIsUnavailabilityDialogOpen] =
    useState(false)
  const [editingUnavailability, setEditingUnavailability] = useState<
    Unavailability | undefined
  >(undefined)

  const militaryPerson = military.find((m) => m.id === militaryId)

  if (!militaryPerson) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h1 className="text-2xl font-bold">Militar não encontrado</h1>
        <Button asChild>
          <Link to="/military">Voltar para a lista</Link>
        </Button>
      </div>
    )
  }

  const personScales = scales.filter((s) =>
    militaryPerson.associatedScales.includes(s.id),
  )

  const personUnavailabilities = unavailabilities
    .filter((u) => u.militaryId === militaryId)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    )

  const handleDeleteUnavailability = (id: string) => {
    deleteUnavailability(id)
    toast({
      title: 'Indisponibilidade removida',
      description: 'O registro foi excluído com sucesso.',
    })
  }

  const handleEditUnavailability = (unavailability: Unavailability) => {
    setEditingUnavailability(unavailability)
    setIsUnavailabilityDialogOpen(true)
  }

  const handleAddUnavailability = () => {
    setEditingUnavailability(undefined)
    setIsUnavailabilityDialogOpen(true)
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/military">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Perfil do Militar</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage
                  src={militaryPerson.avatarUrl}
                  alt={militaryPerson.name}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(militaryPerson.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{militaryPerson.name}</CardTitle>
            <Badge variant="secondary" className="mt-2 w-fit mx-auto">
              {militaryPerson.rank}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{militaryPerson.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{militaryPerson.phone}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Escalas Associadas
              </h3>
              <div className="flex flex-wrap gap-2">
                {personScales.length > 0 ? (
                  personScales.map((scale) => (
                    <Badge key={scale.id} variant="outline">
                      {scale.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Nenhuma escala associada.
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarOff className="h-5 w-5" />
              Indisponibilidades e Missões
            </CardTitle>
            <Button onClick={handleAddUnavailability} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            {personUnavailabilities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personUnavailabilities.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <Badge
                          variant={
                            u.type === 'Missão' ? 'default' : 'secondary'
                          }
                        >
                          {u.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(u.startDate), 'dd/MM/yy')} até{' '}
                        {format(new Date(u.endDate), 'dd/MM/yy')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {u.observations || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUnavailability(u)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Excluir indisponibilidade?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteUnavailability(u.id)
                                  }
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma indisponibilidade registrada.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isUnavailabilityDialogOpen && (
        <ManageUnavailabilityDialog
          militaryId={militaryId!}
          unavailability={editingUnavailability}
          isOpen={isUnavailabilityDialogOpen}
          onOpenChange={setIsUnavailabilityDialogOpen}
        />
      )}
    </div>
  )
}
