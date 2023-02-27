<?php
session_start();
if (!isset($_SESSION['loggedin'])) {
  header('Location: login.php');
  exit();
}
?>
<?php
// echo $recipientId=$_GET["UserIdx"];
// echo $UserId = $_GET['UserId'];
// session_start();


?>

    <!DOCTYPE html>
    <html>

    <head>
        <title>Chat App</title>
        <link rel="icon" href="img\offeyicial.png" type="image/jpeg" sizes="32x32" />
        <link rel="stylesheet" href="css\all.min.css">
        <link rel="stylesheet" href="css\font\bootstrap-icons.css">
        <link rel="stylesheet" href="css\boostrap-icons">
        <link rel="stylesheet" href="css\fontawesome.min.css">



        <style>
            nav {
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 50px;
                background-color: #04AA6D;
                color: white;
                padding: 0 20px;
            }
            
            nav a {
                color: white;
                text-decoration: none;
                margin: 0 10px;
            }
            
            .chat-container {
                width: 80%;
                margin: 50px auto;
                background-color: #f2f2f2;
                border-radius: 10px;
                padding: 20px;
            }
            
            .chat-header {
                text-align: center;
                /* display: flex; */
                background-color: #04AA6D;
                color: white;
                padding: 10px;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
            }
            .recipientPassport{
                border-radius: 50%;
                width: 50px;
                height: 50px;
                margin-right: 10px;
            }
            
            .chat-header h1 {
                margin: 0;
            }
            
            .chat-messages {
                height: 300px;
                overflow-y: scroll;
                padding: 20px;
            }
            
            .chat-messages ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .chat-messages li {
                display: flex;
                align-items: flex-start;
                margin-bottom: 10px;
            }
            .chatbox {
        background-color: #f2f2f2;
        height: calc(100vh - 200px);
        overflow-y: scroll;
        padding: 10px;
    }
    .Sent {
        float: right;
        background-color: #dcf8c6;
        color: #444;
        padding: 8px;
        border-radius: 10px;
        margin-top: 10px;
        margin-left: auto;
        max-width: 75%;
        word-wrap: break-word;
        clear: both;
    }
    .received {
        float: left;
        background-color: white;
        color: #444;
        padding: 8px;
        border-radius: 10px;
        margin-top: 10px;
        margin-right: auto;
        max-width: 75%;
        word-wrap: break-word;
        clear: both;
    }
    .image {
        text-align: center;
    }
    .image img {
        max-width: 100%;
        max-height: 300px;
        border-radius: 10px;
        margin-top: 10px;
    }
    .message {
        margin-bottom: 5px;
    }
            
            .chat-input {
                display: flex;
                padding: 20px;
                background-color: #f2f2f2;
                border-bottom-left-radius: 10px;
                border-bottom-right-radius: 10px;
            }
            
            .chat-input input[type="text"] {
                flex: 1;
                padding: 12px 20px;
                margin: 8px 0;
                box-sizing: border-box;
                border: 2px solid #ccc;
                border-radius: 10px;
                box-shadow: 2px 2px 2px blue;
            }
            
            button[type="submit"] {
                padding: 12px 20px;
                background-color: #04AA6D;
                color: white;
                border: none;
                border-radius: 5px;
                margin-left: 10px;
            }
            
            .image-icon {
                display: inline-block;
                cursor: pointer;
            }
            
            /* .image-icon i {
                font-size: 25px;
                color: gray;
            } */
            
            .image-input {
                /* display: none; */
                width: 180px;
                background-color: #04AA6D;
                color: white;
            }
            
            textarea {
                width: 100%;
                height: 30px;
                padding: 5px;
                font-size: 16px;
                font-family: montserrat;
                resize: none;
                border-radius: 10px;
                box-shadow: 2px 2px 2px #04AA6D;
            }
            
            .message-sender {
                font-size: 12px;
                color: black;
            }
            
            .chats {
                height: auto;
                background: auto;
                border: 4px;
            }
            .image-input {
          opacity: 0;
          position: absolute;
          pointer-events: none;
        }

        .custom-file-label {
          cursor: pointer;
          color :green;
        }
        .icon {
  position: relative;
  font-size: 20px;
  font-weight: bold;
}

.icon::before {
  content: "";
  position: absolute;
  top: 50%;
  left: -20px;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: black;
}

.icon::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -20px;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: black;
}


        </style>
    </head>

    <body>

        <nav>
            <a href="home.php">Home</a>
            <?php
// session_start();

// Connect to the database
include('db.php');

$UserId = $_SESSION['UserId'];

// Get the surname and first name of the user with the UserId from the database
$sql = "select Surname, First_Name FROM User_Profile WHERE UserId = '$UserId'";
$stmt = sqlsrv_prepare($conn, $sql);
if(sqlsrv_execute($stmt)){
  while($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)){
    $Surname = $row['Surname'];
    $First_Name = $row['First_Name'];
  }
}

// Display the user's surname and first name on the page
echo $Surname . " " . $First_Name;

?>


                <a href="user_profile.php?UserId=<?php echo $_SESSION['UserId']; ?>"><i class="bi bi-person"></i>Profile</a>


        </nav>

        <div class="chat-container">
            <div class="chat-header">
                <h1>
                <?php
include('db.php');

// Get the UserId of the user you are talking to
$recipientId = $_GET['UserIdx'];

// Get the name of the user you are talking to
$sql = "select Surname, First_Name, Passport FROM User_Profile WHERE UserId = '$recipientId'";
$stmt = sqlsrv_prepare($conn, $sql);
if(sqlsrv_execute($stmt)){
    while($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)){
        $recipientSurname = $row['Surname'];
        $recipientFirstName = $row['First_Name'];
        $recipientPassport = $row['Passport'];

    }
}

$UserId = $_SESSION['UserId'];

// Get the surname and first name of the user with the UserId from the database
$sql = "select Surname, First_Name FROM User_Profile WHERE UserId = '$UserId'";
$stmt = sqlsrv_prepare($conn, $sql);
if(sqlsrv_execute($stmt)){
    while($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)){
        $Surname = $row['Surname'];
        $First_Name = $row['First_Name'];
    }
    echo '<img class="recipientPassport" src="UserPassport/' . $recipientPassport. '">';
    echo '<span class="icon">'. $recipientSurname .' '. $recipientFirstName .'</span>';


}
    echo '</div>';
    ?>
    <div class="chatbox">
    <?php
        include 'db.php';

        $query = "SELECT * FROM chats ORDER BY time_sent ASC";
        $result = sqlsrv_query($conn, $query);

        while ($row = sqlsrv_fetch_array($result)) {
            $senderId = $row['senderId'];
            $message = $row['Sent'];
            $sent_image = $row['sentimage'];

            echo '<div class="' . ($senderId == $UserId ? 'Sent' : 'received') . '">';
            echo '<div class="message">';
            echo $message;
            echo '</div>';
            if (!empty($sent_image)) {
                echo '<div class="image"><img src="' . $sent_image . '"></div>';
            }
            echo '</div>';
        }
    ?>
</div>
       <br><br>
        <div class="form-group">
            <textarea class="form-control" id="message" rows="3"></textarea>
            <div class="custom-file">
              <input type="file" class="image-input" id="image" name="image" accept="image/*">
              <label class="custom-file-label" for="image"><i class="bi bi-image"></i> Choose Image</label>
            </div>
            <button type="submit" class="submit">Send</button>
        </div>

        </div>
        <script src="js/jquery.min.js"></script>
        <script>
                  $('.custom-file-label').on('click', function() {
        $(this).siblings('.image-input').trigger('click');
      });

      $('.image-input').on('change', function() {
        var fileName = $(this).val().split('\\').pop();
        $(this).siblings('.custom-file-label').html('<i class="bi bi-check-circle-fill"></i> ' + fileName);
      });

    </script> 
        <script>
            $(document).ready(function() {
                // Update chatbox every 0.5 seconds
                setInterval(function() {
                    $.ajax({
                        url: 'getMessages.php',
                        type: 'GET',
                        success: function(data) {
                            $('.chatbox').html(data);
                        }
                    });
                }, 500);
            });

        </script>

        <script>
            $(document).ready(function() {
                $('.submit').click(function() {
                    var message = $('#message').val();
                    var image = $('.image-input').prop('files')[0];
                    var UserId = '<?php echo $UserId; ?>';
                    var recipientId = '<?php echo $recipientId; ?>';

                    var formData = new FormData();
                    formData.append('message', message);
                    formData.append('image', image);
                    formData.append('UserId', UserId);
                    formData.append('recipientId', recipientId);

                    $.ajax({
                        url: 'send_message.php',
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function(response) {
                            console.log(response);
                            $('#message').val('');
                        }
                    });
                });
            });

        </script>


    </body>

    </html>