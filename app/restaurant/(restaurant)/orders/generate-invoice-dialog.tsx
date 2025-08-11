import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input"
import SelectInput from "@/components/ui/select-input"

const items = [
  {
    sNo: 1,
    itemName: "Notebook",
    qty: 3,
    price: 2.5,
    total: 7.5,
  },
  {
    sNo: 2,
    itemName: "Pen",
    qty: 10,
    price: 0.99,
    total: 9.9,
  },
  {
    sNo: 3,
    itemName: "Desk Lamp",
    qty: 2,
    price: 15.0,
    total: 30.0,
  },
  {
    sNo: 4,
    itemName: "Monitor Stand",
    qty: 1,
    price: 25.99,
    total: 25.99,
  },
  {
    sNo: 5,
    itemName: "USB Cable",
    qty: 5,
    price: 3.2,
    total: 16.0,
  },
  {
    sNo: 6,
    itemName: "Notebook",
    qty: 3,
    price: 2.5,
    total: 7.5,
  },
  {
    sNo: 7,
    itemName: "Pen",
    qty: 10,
    price: 0.99,
    total: 9.9,
  },
  {
    sNo: 8,
    itemName: "Desk Lamp",
    qty: 2,
    price: 15.0,
    total: 30.0,
  },
  {
    sNo: 9,
    itemName: "Monitor Stand",
    qty: 1,
    price: 25.99,
    total: 25.99,
  },
  {
    sNo: 10,
    itemName: "USB Cable",
    qty: 5,
    price: 3.2,
    total: 16.0,
  },
];

const GenerateInvoiceDialog = ({ disabled }: { disabled: boolean }) => {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="secondary" disabled={disabled} className='min-w-1/3 cursor-pointer'>Generate Invoice</Button>
        </DialogTrigger>
        <DialogContent className="sm:min-w-6/7 md:min-w-2.5/3 max-h-[calc(100vh-2rem)] lg:min-w-fit font-rubik-400">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Generate Invoice</DialogTitle>
            <DialogDescription className="sr-only">
              Click on &apos;Confirm & Print&apos; to generate the invoice for the order.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex flex-row items-center gap-2">
              <p>Name:</p> 
              {/* <p className="text-neutral-500">Shahzaib Awan</p> */}
              <Input type="text" className="w-fit" placeholder="Random" />
            </div>
            <div className="flex flex-row items-center gap-2">
              <p>Payment:</p> 
              {/* <p className="text-neutral-500">Cash</p>  */}
              <SelectInput options={[{label: 'Cash', value: 'cash'}, {label: 'Credit', value: 'credit'}, {label: 'Online', value: 'online'}]} 
                           className="w-fit" 
                           onChange={(e) => console.log(e)} 
                           placeholder="Cash, Cred..."
              />

            </div>
            <div className="flex flex-row items-center gap-2">
              <p>Order Type:</p> 
              {/* <p className="text-neutral-500">Take away</p>  */}
              <SelectInput options={[{label: 'Drive Thru', value: 'drive_Thru'}, {label: 'Take Away', value: 'takeaway'},{label: 'Dine In', value: 'dine_In'}]} 
                           className="w-fit" 
                           onChange={(e) => console.log(e)} 
                            placeholder="Drive Thru, ..."
              />
            </div>
          </div>

          <div className="grid w-full [&>div]:max-h-[40vh] border-b [&>div]:rounded">
            <Table>
              <TableHeader>
                <TableRow className="[&>*]:whitespace-nowrap  bg-white hover:bg-white sticky top-0 uppercase text-xs after:content-[''] after:inset-x-0 after:h-px after:absolute after:bottom-0">
                  <TableHead className="pl-4 min-w-auto sm:min-w-20 text-neutral-500">S.No</TableHead>
                  <TableHead className="min-w-auto sm:min-w-56 text-neutral-500">Item Name</TableHead>
                  <TableHead className="min-w-auto sm:min-w-20 text-neutral-500">Qty</TableHead>
                  <TableHead className="min-w-auto sm:min-w-20 text-neutral-500">Price (PKR)</TableHead>
                  <TableHead className="min-w-auto sm:min-w-20 text-neutral-500">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-hidden">
                {items.map((product, index) => (
                  <TableRow
                    key={product.sNo}
                    className="[&>*]:whitespace-nowrap h-10 font-rubik-400"
                  >
                    <TableCell className="pl-4">{index + 1}</TableCell>
                    <TableCell className="">{product.itemName}</TableCell>
                    <TableCell>{product.qty}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.price * product.qty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex flex-row text-neutral-500 justify-between">
              <p>Subtotal</p> <p>300</p>
            </div>
            <div className="flex flex-row text-neutral-500 justify-between">
              <p>Discount %</p> <p>10 %</p>
            </div>
            <div className="flex flex-row justify-between">
              <p>Grand Total</p> <p className="text-orange-500">270 PKR</p>
            </div>

          </div>

          <DialogFooter className="flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="w-1/2 sm:w-auto">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="w-1/2 sm:w-auto" variant={'green'}>Confirm & Print</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default GenerateInvoiceDialog