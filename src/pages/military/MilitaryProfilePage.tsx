import { useParams, useNavigate } from 'react-router-dom'
import useDataStore from '@/stores/data.store'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Mail,
  Phone,
  CalendarDays,
  Shield,
  Trash2,
} from 'lucide-react'
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
import { format } from 'date-fns'
import { ManageUnavailabilityDialog } from '@/components/ManageUnavailabilityDialog'
import { EditMilitaryDialog } from '@/components/EditMilitaryDialog'
import { Separator } from '@/components/ui/separator'

export default function MilitaryProfilePage() {
  const { militaryId } = useParams()
  const navigate = useNavigate()
  const {
    military,
    unavailabilities,
    deleteMilitary,
    deleteUnavailability,
    unavailabilityTypes,
  } = useDataStore()

  const person = military.find((m) => m.id === militaryId)

  if (!person) {
    return <div>Military personnel not found</div>
  }

  const personUnavailabilities = unavailabilities.filter(
    (u) => u.militaryId === person.id,
  )

  const handleDelete = async () => {
    await deleteMilitary(person.id)
    navigate('/military')
  }

  const getTypeName = (id: string) => {
    return unavailabilityTypes.find((t) => t.id === id)?.name || 'Unknown'
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="pl-0"
        onClick={() => navigate('/military')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to List
      </Button>

      <div className="flex flex-col gap-6 md:flex-row">
        <Card className="w-full md:w-1/3">
          <CardHeader className="flex flex-col items-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={person.avatarUrl} alt={person.name} />
              <AvatarFallback className="text-2xl">
                {person.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4 text-2xl">{person.name}</CardTitle>
            <CardDescription className="text-lg">{person.rank}</CardDescription>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline">{person.unit}</Badge>
              <Badge
                variant={person.status === 'Active' ? 'default' : 'secondary'}
              >
                {person.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 opacity-70" />
              <span>{person.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 opacity-70" />
              <span>{person.phone}</span>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <EditMilitaryDialog military={person} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Profile
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Military Profile</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {person.name}? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <div className="w-full md:w-2/3">
          <Tabs defaultValue="unavailability" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="unavailability">Unavailability</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="unavailability" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Recorded Absences</h3>
                <ManageUnavailabilityDialog militaryId={person.id} />
              </div>
              <div className="space-y-2">
                {personUnavailabilities.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    No unavailability records found.
                  </div>
                ) : (
                  personUnavailabilities.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                          <CalendarDays className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {getTypeName(u.unavailabilityTypeId)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(u.startDate, 'MMM d, yyyy')} -{' '}
                            {format(u.endDate, 'MMM d, yyyy')}
                          </p>
                          {u.reasonDetails && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {u.reasonDetails}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteUnavailability(u.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="history">
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <Shield className="mx-auto mb-2 h-8 w-8 opacity-50" />
                Service history will appear here.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
