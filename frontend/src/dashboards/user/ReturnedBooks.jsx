import React, { useEffect, useState } from 'react'
import { getReturnedBooks } from '../../http';
import { formatDate } from '../../utils/formatDate';

const columns = ["ISBN","Title","Author","Borrowed Date","Returned Date"];

const ReturnedBooks = () => {
  const [books,setBooks] = useState(null);

  const fetchReturnedBooks =async () => {
      try {
        const {data} = await getReturnedBooks();
        console.log(data?.returnedBooks);
        setBooks(data?.returnedBooks);
      } catch (error) {
          console.log(error);
      }
  }

  useEffect(()=>{
    fetchReturnedBooks();
  },[]);
  return (
    <div className="datalist__wrapper">
    <h2>Returned Books</h2>
    <span>List of returned books</span>

    <div className="table__wrapper bg__accent">
        <table cellSpacing="0" cellPadding="0">
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
                <td>{formatDate(item?.borrowDate)}</td>
                <td>{formatDate(item?.returnedDate)}</td>
              </tr>
                })
              }
            </tbody>
        </table>
    </div>
</div>
  )
}

export default ReturnedBooks