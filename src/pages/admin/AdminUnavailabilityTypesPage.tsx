import { useState } from 'react'
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
import useDataStore from '@/stores/data.store'
import { UnavailabilityTypeDefinition } from '@/types'
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
import { ManageUnavailabilityTypeDialog } from '@/components/ManageUnavailabilityTypeDialog'
import { toast } from '@/components/ui/use-toast'

export default function AdminUnavailabilityTypesPage() {
  const { unavailabilityTypes, unavailabilities, deleteUnavailabilityType } =
    useDataStore()
  const [editingType, setEditingType] = useState<
    UnavailabilityTypeDefinition | undefined
  >(undefined)
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false)
  const [typeToDelete, setTypeToDelete] = useState<
    UnavailabilityTypeDefinition | undefined
  >(undefined)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleCreate = () => {
    setEditingType(undefined)
    setIsManageDialogOpen(true)
  }

  const handleEdit = (typeDef: UnavailabilityTypeDefinition) => {
    setEditingType(typeDef)
    setIsManageDialogOpen(true)
  }

  const initiateDelete = (typeDef: UnavailabilityTypeDefinition) => {
    const isUsed = unavailabilities.some((u) => u.type === typeDef.name)
    if (isUsed) {
      toast({
        variant: 'destructive',
        title: 'Não é possível excluir',
        description: `O tipo "${typeDef.name}" está sendo usado em registros de indisponibilidade. Remova os registros associados antes de excluir este tipo.`,
      })
      return
    }
    setTypeToDelete(typeDef)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (typeToDelete) {
      deleteUnavailabilityType(typeToDelete.id)
      toast({
        title: 'Tipo excluído',
        description: `O tipo "${typeToDelete.name}" foi excluído com sucesso.`,
      })
      setIsDeleteDialogOpen(false)
      setTypeToDelete(undefined)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tipos de Indisponibilidade</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias de afastamento e indisponibilidade.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Tipo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unavailabilityTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(type)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => initiateDelete(type)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isManageDialogOpen && (
        <ManageUnavailabilityTypeDialog
          typeDef={editingType}
          isOpen={isManageDialogOpen}
          onOpenChange={setIsManageDialogOpen}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              tipo "{typeToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
