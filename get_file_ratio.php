<?php

$file = $_GET['file'];

$dotPos = strpos($file, '.');

if ($dotPos === false)
{
    $path = $file . '.jpg';    
}
else
{
    $fileWithNoSuffix = substr($file, 0, ($dotPos)) ;
    $path = $fileWithNoSuffix . '.jpg';  
    
}



$result = new stdClass();


$dir = '/var/www/vhosts/justinwylliephotography.com/jwp2.justinwylliephotography.com/clients/ocva/awards2017/thumbs/';
$filePath = $dir . '/' . $path;


$test = '/var/www/vhosts/justinwylliephotography.com/jwp2.justinwylliephotography.com/clients/ocva/awards2017/thumbs/20170509-_D805207.jpg';
$sizeInfo = getimagesize($filePath);





if ($sizeInfo === false) {
    $result->result = false;
}
else
{
     $result->result = true;
     $largestSide = max($sizeInfo[0], $sizeInfo[1]);
     $smallestSize = min($sizeInfo[0], $sizeInfo[1]);
     $ratio =  number_format(($largestSide / $smallestSize), 2);
     $result->path = $path;
     
     switch ($ratio) {
        
        case 1:
            $result->size = ['10" x 10"', '12" x 12"'];  
            break;
            
        case 1.25:
            $result->size = '10" x 8"';
            break; 
            
        case 1.5:
            $result->size = ['9" x 6"', '12" x 8"'];  
            break;   
           
        case 1.77:
            $result->size = '12" x 8"';
            break;           
     
         default:
            $result->size = ['9" x 6"', '12" x 8"'];
            
     
     }
    
     
}

header('Content-Type: application/json');
echo json_encode($result);





?>