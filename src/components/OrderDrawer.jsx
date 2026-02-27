import React from "react";

export default function OrderDrawer({ order, onClose }) {

if(!order) return null;

return (

<div style={{
position:"fixed",
right:0,
top:0,
width:400,
height:"100%",
background:"#fff",
boxShadow:"-2px 0 10px rgba(0,0,0,0.2)",
padding:20,
overflow:"auto",
zIndex:1000
}}>

<h4>Order Details</h4>

<hr/>

{/* USER */}

<h6>User</h6>

<p>

{order.user?.name}

<br/>

{order.user?.phone}

</p>


{/* ADDRESS */}

<h6>Address</h6>

<p>

{order.address?.house}

<br/>

{order.address?.area}

<br/>

{order.address?.city}

</p>


<hr/>


{/* PRODUCTS */}

<h6>Products</h6>

{order.items?.map((item,i)=>{

const itemTotal = item.price * item.qty;

return(

<div key={i}
style={{
borderBottom:"1px solid #eee",
paddingBottom:10,
marginBottom:10
}}>

<div style={{
display:"flex",
gap:10
}}>

<img
src={item.image}
style={{
width:60,
height:60,
objectFit:"cover",
borderRadius:8
}}
/>

<div>

<strong>{item.name}</strong>

<br/>

Qty: {item.qty}

<br/>

Price: ₹{item.price}

<br/>

Total: ₹{itemTotal}


{/* VARIANT */}

{item.variant?.label && (

<>
<br/>
Variant: {item.variant.label}
</>

)}


{/* ADDONS */}

{item.selectedAddons?.length>0 && (

<>
<br/>
Addons:

{item.selectedAddons.map((a,i)=>(
<div key={i}>
{a.name} ₹{a.price}
</div>
))}

</>

)}


{/* CUSTOM */}

{item.customizations?.specialInstructions &&(

<>
<br/>
Note:
{item.customizations.specialInstructions}
</>

)}


</div>

</div>

</div>

);

})}


<hr/>


{/* BILL */}

<h6>Bill</h6>

<p>

Total Items: {order.items?.length}

<br/>

Grand Total: ₹{order.total}

<br/>

Payment: {order.paymentMethod}

<br/>

Status: {order.status}

</p>


<hr/>


<button
onClick={onClose}
style={{
width:"100%",
padding:10,
background:"#000",
color:"#fff",
border:"none"
}}
>

Close

</button>

</div>

);

}