import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useDataStore from '@/stores/data.store'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

const MissionsOverview = () => {
  const { unavailabilities, military, unavailabilityTypes } = useDataStore()

  // Sort unavailabilities by start date (recent first) and take top 5
  const recentUnavailabilities = [...unavailabilities]
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    .slice(0, 5)

  const getMilitaryName = (id: string) => {
    const m = military.find((mil) => mil.id === id)
    return m ? `${m.rank} ${m.name}` : 'Unknown'
  }

  const getTypeName = (id: string) => {
    return unavailabilityTypes.find((t) => t.id === id)?.name || 'Unknown'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Unavailabilities / Missions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Military</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentUnavailabilities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              recentUnavailabilities.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {getMilitaryName(u.militaryId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTypeName(u.unavailabilityTypeId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(u.startDate, 'MMM dd')} -{' '}
                    {format(u.endDate, 'MMM dd')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {u.reasonDetails || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default MissionsOverview
