<?php

$conn = new PDO('mysql:host=localhost;dbname=jagrdkpk_m2;charset=utf8', 'jagrdkpk', 'hhsbn9', [
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);

$username = $_POST['username'];
$score = $_POST['score'];
$time = $_POST['time'];

$insert = $conn->prepare('INSERT INTO ranking(username, score, time) VALUES (?, ?, ?)');
$insert->execute([
    $username,
    $score,
    $time
]);

$select = $conn->query('SELECT * FROM ranking');
echo json_encode($select->fetchAll());