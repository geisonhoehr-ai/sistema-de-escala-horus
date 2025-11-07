import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useDataStore from '@/stores/data.store'
import useAuthStore from '@/stores/auth.store'
import { Military } from '@/types'
import { EditMilitaryDialog } from '@/components/EditMilitaryDialog'
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

export default function MilitaryListPage() {
  const { military, scales, deleteMilitary } = useDataStore()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'Admin'
  const [editingMilitary, setEditingMilitary] = useState<Military | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  const handleEdit = (m: Military) => {
    setEditingMilitary(m)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Militares</h1>
          <p className="text-muted-foreground">
            Gerencie as informações e indisponibilidades dos militares.
          </p>
        </div>
        {isAdmin && (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Novo Militar
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Militar</TableHead>
                <TableHead>Patente/Graduação</TableHead>
                <TableHead>Escalas Associadas</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {military.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={m.avatarUrl} alt={m.name} />
                        <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
                      </Avatar>
                      {m.name}
                    </div>
                  </TableCell>
                  <TableCell>{m.rank}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.associatedScales
                      .map((id) => scales.find((s) => s.id === id)?.name)
                      .join(', ')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/military/${m.id}`}>Ver Perfil</Link>
                      </Button>
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(m)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Tem certeza?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso
                                    excluirá permanentemente o militar "{m.name}
                                    ".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMilitary(m.id)}
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {editingMilitary && (
        <EditMilitaryDialog
          militaryPerson={editingMilitary}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  )
}
