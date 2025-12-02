import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Military } from '@/types'
import useDataStore from '@/stores/data.store'
import { toast } from './ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload } from 'lucide-react'

const militarySchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  rank: z.string().min(2, 'O posto/graduação é obrigatório.'),
  email: z.string().email('Email inválido.'),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  associatedScales: z.array(z.string()),
})

type MilitaryFormValues = z.infer<typeof militarySchema>

interface ManageMilitaryDialogProps {
  militaryPerson?: Military
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const ManageMilitaryDialog = ({
  militaryPerson,
  isOpen,
  onOpenChange,
}: ManageMilitaryDialogProps) => {
  const { addMilitary, updateMilitary, scales } = useDataStore()
  const isEditing = !!militaryPerson
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const form = useForm<MilitaryFormValues>({
    resolver: zodResolver(militarySchema),
    defaultValues: {
      name: '',
      rank: '',
      email: '',
      phone: '',
      avatarUrl: '',
      associatedScales: [],
    },
  })

  useEffect(() => {
    if (militaryPerson) {
      form.reset({
        name: militaryPerson.name,
        rank: militaryPerson.rank,
        email: militaryPerson.email,
        phone: militaryPerson.phone,
        avatarUrl: militaryPerson.avatarUrl,
        associatedScales: militaryPerson.associatedScales,
      })
      setPreviewUrl(militaryPerson.avatarUrl)
    } else {
      const defaultAvatar = `https://img.usecurling.com/ppl/medium?gender=male&seed=${Date.now()}`
      form.reset({
        name: '',
        rank: '',
        email: '',
        phone: '',
        avatarUrl: defaultAvatar,
        associatedScales: [],
      })
      setPreviewUrl(defaultAvatar)
    }
  }, [militaryPerson, form, isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewUrl(result)
        form.setValue('avatarUrl', result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = (data: MilitaryFormValues) => {
    const finalAvatarUrl = previewUrl || data.avatarUrl || ''

    if (isEditing && militaryPerson) {
      updateMilitary({
        id: militaryPerson.id,
        ...data,
        avatarUrl: finalAvatarUrl,
      })
      toast({
        title: 'Militar Atualizado',
        description: `Os dados de "${data.name}" foram atualizados.`,
      })
    } else {
      addMilitary({
        ...data,
        avatarUrl: finalAvatarUrl,
      })
      toast({
        title: 'Militar Adicionado',
        description: `"${data.name}" foi adicionado ao sistema.`,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar' : 'Adicionar'} Militar
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere as informações do militar.'
              : 'Preencha os dados para adicionar um novo militar.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Avatar className="h-24 w-24 border-2 border-muted">
                <AvatarImage src={previewUrl} objectFit="cover" />
                <AvatarFallback>Foto</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="relative"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Carregar Foto
                  <Input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posto/Graduação</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sargento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="associatedScales"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Escalas Associadas</FormLabel>
                  </div>
                  <ScrollArea className="h-[120px] border rounded-md p-2">
                    {scales.map((scale) => (
                      <FormField
                        key={scale.id}
                        control={form.control}
                        name="associatedScales"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={scale.id}
                              className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(scale.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          scale.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== scale.id,
                                          ),
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {scale.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Salvar Alterações' : 'Adicionar Militar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
