import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table' // Import fixed
import {
  Card as CardComponent,
  CardContent as CardContentComponent,
} from '@/components/ui/card'
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import useDataStore from '@/stores/data.store'
import useAuthStore from '@/stores/auth.store'
import { ManageScaleDialog } from '@/components/ManageScaleDialog'
import { Scale } from '@/types'
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

export default function ScalesListPage() {
  const { scales, deleteScale } = useDataStore()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'Admin'
  const [editingScale, setEditingScale] = useState<Scale | undefined>(undefined)
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditingScale(undefined)
    setIsManageDialogOpen(true)
  }

  const handleEdit = (scale: Scale) => {
    setEditingScale(scale)
    setIsManageDialogOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Escalas de Serviço</h1>
          <p className="text-muted-foreground">
            Gerencie todas as escalas de serviço cadastradas.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Nova Escala
          </Button>
        )}
      </div>

      <CardComponent>
        <CardContentComponent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Escala</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">
                  Militares Associados
                </TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scales.map((scale) => (
                <TableRow key={scale.id}>
                  <TableCell className="font-medium">{scale.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {scale.description}
                  </TableCell>
                  <TableCell className="text-center">
                    {scale.associatedMilitaryIds.length}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/scales/${scale.id}`}>Ver Detalhes</Link>
                      </Button>
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(scale)}>
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
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteScale(scale.id)}
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
        </CardContentComponent>
      </CardComponent>
      {isManageDialogOpen && (
        <ManageScaleDialog
          scale={editingScale}
          isOpen={isManageDialogOpen}
          onOpenChange={setIsManageDialogOpen}
        />
      )}
    </div>
  )
}
