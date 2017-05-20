<?php


$orderPost = file_get_contents('php://input');
$order = json_decode($orderPost);
$result = new stdClass();


function sendUserError($msg)
{
    global $result;
    mail("info@mms-oxford.com", "Error on Event Sales", $msg);
    header("Content-type: application/json");
    $result->result = false;
    echo json_encode($result);
    exit();
}

function sendUserSuccess()
{
    global $result;
    header("Content-type: application/json");
    $result->result = true;
    echo json_encode($result);
    exit();
}



//$conn
include('/var/www/vhosts/justinwylliephotography.com/event_sales_db.php');
if ($conn->connect_error) {
       var_dump("here1");
    $msg = "Connect error. Check log. Client email was: '" .  $order->customerData->email . "'";
    sendUserError($msg) ;
}

$conn->set_charset("utf8")  ;
$orderPost = $conn->real_escape_string($orderPost);

if (!($stmt = $conn->prepare("INSERT INTO orders (order_json) VALUES (?)")))
{
    $msg = "Connect error. Check log. Client email was: '" .  $order->customerData->email . "'";
    sendUserError($msg) ;   
}
if (!$stmt->bind_param("s", $orderPost))
{
    $msg = "Connect error. Check log. Client email was: '" .  $order->customerData->email . "'";
    sendUserError($msg) ;
}
if (!$stmt->execute()  )
{
    $msg = "Connect error. Check log. Client email was: '" .  $order->customerData->email . "'";
    sendUserError($msg) ;
}


$result->orderId = mysqli_insert_id($conn);
mail("info@mms-oxford.com", "Order on OCVA Event Sales: Order Id: ". $result->orderId, $orderPost);
sendUserSuccess();


$conn->close();




?>      



