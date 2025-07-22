import React, { useEffect, useState } from 'react'
import { unReservedBook, getReservedBooks } from '../../http';
import { formatDate } from '../../utils/formatDate';
import {toast} from 'react-hot-toast';

const columns = ["ISBN","Title","Author","Reserved Date","Due Date","Actions"];

function calculateDueDate(borrowedDateISOString) {
  // Convert the borrowed date string to a Date object
  const borrowedDate = new Date(borrowedDateISOString);

  // Calculate the due date by adding 7 days
  const dueDate = new Date(borrowedDate);
  dueDate.setDate(dueDate.getDate() + 3);

  return dueDate;
}

const ReservedBooks = () => {
  const [books,setBooks] = useState(null);

  const fetchReservedBooks =async () => {
      try {
        const {data} = await getReservedBooks();
        console.log(data?.reservedBooks);
        console.log(data);
        setBooks(data?.reservedBooks);
      } catch (error) {
          console.log(error);
      }
  }

  const handleUnReservedBook = async (_id) => {
    const promise = unReservedBook(_id);
    toast.promise(promise, {
      loading: "Loading...",
      success: (response) => {
        setBooks(response?.data?.reservedBooks);
        return "Book Unreserved  successfully..";
      },
      error: (err) => {
        console.log();
        return err?.response?.data?.message || "Something went wrong !";
      },
    });
  }

  useEffect(()=>{
    fetchReservedBooks();
  },[]);
  return (
    <div className="datalist__wrapper">
    <h2>Reserved Books</h2>
    <span>List of reserved books</span>

    <div className="table__wrapper bg__accent">
        <table cellspacing="0" cellpadding="0">
            <thead>
              <tr className="bg__secondary">
                <td>Sr#</td>
                {
                  columns?.map((column)=>{
                    return <td key={column}>{column}</td>
                  })
                }
              </tr>
            </thead>
            <tbody>
              {
                books?.map((item,index)=>{
                  return <tr key={item._id}>
                <td>{index+1}</td>
                <td>{item?.book?.ISBN}</td>
                <td>{item?.book?.title}</td>
                <td>{item?.book?.author}</td>
                <td>{formatDate(item?.date)}</td>
                <td>{formatDate(calculateDueDate(item?.date))}</td>
                <td><button className="btn btn__secondary" onClick={()=>{handleUnReservedBook(item._id)}}>Un reserved</button></td>
              </tr>
                })
              }
            </tbody>
        </table>
    </div>
</div>
  )
}

export default ReservedBooks