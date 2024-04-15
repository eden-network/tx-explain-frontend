// import { Box, Title } from "@mantine/core"
// import React from "react"
// import { type GetTransactionData } from "wagmi/query"

// // Assuming you have these types defined somewhere or you define them here
// type TransactionReceipt = {
//     transactionId: string;
//     blockHash: string;
//     status: 'success' | 'fail';
//   };
  
//   type TransactionError = string;  // Simple error handling as a string

// const Fundamentals = ({
//     transactionReceipt,
//     isTransactionReceiptLoading
// }: {
//     transactionReceipt: GetTransactionData<TransactionReceipt, TransactionError>,
//     isTransactionReceiptLoading: boolean
// }) => {
//     return (
//         <Box mb="xl">
//             <Title order={2} mb="md">
//                 Fundamentals
//             </Title>
//             {isTransactionReceiptLoading.toString()}
//             {transactionReceipt?.blockHash}
//         </Box>
//     )
// }

// export default Fundamentals