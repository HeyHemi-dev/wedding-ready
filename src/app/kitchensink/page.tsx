import { Table, TableRow, TableCell, TableHeaderRow } from '@/components/pricing/table'
import { AddCreditButton } from '@/components/tiles/add-credit-button'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'

export default function KitchensinkPage() {
  return (
    <>
      <Section>
        <Area className="grid gap-friend">
          <h1>Kitchensink</h1>
        </Area>
      </Section>
      <Section>
        <Area className="grid gap-friend">
          <AddCreditButton tileId="123" />
        </Area>
      </Section>
      <Section>
        {(() => {
          const numColumns = 4
          const numRows = 3

          return (
            <Table
              isFirstColFrozen
              className="ui-small"
              style={{ gridTemplateRows: `repeat(${numRows}, max-content)`, gridTemplateColumns: `repeat(${numColumns}, minmax(20rem, 1fr))` }}>
              <TableHeaderRow className="ui-small-s1">
                {Array.from({ length: numColumns }).map((_, index) => (
                  <TableCell key={index}>Header {index + 1}</TableCell>
                ))}
              </TableHeaderRow>
              {Array.from({ length: numRows }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: numColumns }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      {rowIndex + 1}-{colIndex + 1}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </Table>
          )
        })()}
      </Section>
    </>
  )
}
