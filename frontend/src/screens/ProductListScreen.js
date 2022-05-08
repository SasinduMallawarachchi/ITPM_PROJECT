import React, { useEffect } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import Paginate from '../components/Paginate'

import jspdf from 'jspdf'
import "jspdf-autotable"
import {
  listProducts,
  deleteProduct,
  createProduct,
} from '../actions/productActions'
import { PRODUCT_CREATE_RESET } from '../constants/productConstants'
import ProductSearchBox from '../components/ProductSearchBox'


const ProductListScreen = ({ history, match }) => {
  const pageNumber = match.params.pageNumber || 1
  const keyword = match.params.keyword

  console.log(keyword)
  const dispatch = useDispatch()


  const productList = useSelector((state) => state.productList)
  const { loading, error, products, page, pages } = productList

  const productDelete = useSelector((state) => state.productDelete)
  const {
    loading: loadingDelete,
    error: errorDelete,
    success: successDelete,
  } = productDelete

  const productCreate = useSelector((state) => state.productCreate)
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
    product: createdProduct,
  } = productCreate

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  useEffect(() => {
    dispatch({ type: PRODUCT_CREATE_RESET })

    if (!userInfo || !userInfo.isAdmin) {
      history.push('/login')
    }

    if (successCreate) {
      history.push(`/admin/product/${createdProduct._id}/edit`)
    } else {
      //dispatch(listProducts('', pageNumber))
      dispatch(listProducts(keyword, pageNumber))
    }
  }, [
    dispatch,
    history,
    userInfo,
    successDelete,
    successCreate,
    createdProduct,
    pageNumber,
    keyword
  ])

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure')) {
      dispatch(deleteProduct(id))
    }
  }

  const createProductHandler = () => {
    dispatch(createProduct())
  }

  
     // genarate pdf

     const generatePDF = tickets => {

      const doc = new jspdf();
      const tableColumn = ["Id", "Name", "Price", "Category", "Brand"];
      const tableRows = [];
      const date = Date().split(" ");
      const dateStr = date[1] + "-" + date[2] + "-" + date[3];

      tickets.map(ticket => {
          const ticketData = [
              ticket._id,
              ticket.name,
              ticket.price,
              ticket.category,
              ticket.brand,
              //ticket.designation,
              //ticket.mail,
             // ticket.type,
          ];
          tableRows.push(ticketData);
      })
      doc.text("DYNO_TECH", 70, 8).setFontSize(13);
      doc.text("ProductReport", 14, 16).setFontSize(13);
      doc.text(`Report Genarated Date - ${dateStr}`, 14, 23);
      //right down width height
      //doc.addImage(img, 'JPEG', 170, 8, 25, 25);
      doc.autoTable(tableColumn, tableRows, { styles: { fontSize: 8, }, startY:35});
      doc.save("Product Report.pdf");
  };


  return (
    <>
    <ProductSearchBox history={history} /><br/>
      <Row className='align-items-center'>
        <Col>
          <h1>Products</h1>
        </Col>
        

        <div class="buttonn">
       <button type="button" class="btn btn-primary" style={{backgroundColor:'#133C48'}} onClick={() => generatePDF(products)} >GenerateReport</button> <br></br>
            </div>




        <Col className='text-right'style={{display: 'flex', justifyContent: 'right'}}>
          <Button className='my-3' style={{backgroundColor:'#133C48'}} onClick={createProductHandler}>
            <i className='fas fa-plus'></i> Create Product
          </Button>
        </Col>
      </Row>
      {loadingDelete && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {loadingCreate && <Loader />}
      {errorCreate && <Message variant='danger'>{errorCreate}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>Rs.{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <LinkContainer to={`/admin/product/${product._id}/edit`}>
                      <Button variant='light' className='btn-sm'>
                        <i className='fas fa-edit'></i>
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      onClick={() => deleteHandler(product._id)}
                    >
                      <i className='fas fa-trash'></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginate pages={pages} page={page} isAdmin={true} />
        </>
      )}
    </>
  )
}

export default ProductListScreen
