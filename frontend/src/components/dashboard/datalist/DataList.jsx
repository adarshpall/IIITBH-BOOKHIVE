import "./datalist.scss";

const DataList = ({heading,subheading,data,columns,keys}) => {
  console.log(data);
  return (
    <div className="datalist__wrapper">
        <h2>{heading}</h2>
        <span>{subheading}</span>

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
                    data?.map((i)=>{
                      return <tr>
                    <td>1</td>
                    <td>101</td>
                    <td>Data Sturcture and Algorithm</td>
                    <td>John Doe</td>
                    <td>Computer Science</td>
                    <td>13 Fab 2023</td>
                  </tr>
                    })
                  }
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default DataList