<?php

class sprite {
    public function __construct($folder, $output, $x, $y)
    {
        $this->folder = $folder;
        $this->output = $output;
        $this->x = $x;
        $this->y = $y;
        $this->files = [];
        $this->create_sprite();
    }

    function create_sprite()
    {
        $handle = opendir($this->folder);
        while (false !== $file = readdir($handle)) {
            if ($file === '.' || $file === '..') continue;
            $this->files[$file] = $file;
        }
        closedir($handle);

        $this->xx = $this->x * count($this->files);
        $im = imagecreatetruecolor($this->xx, $this->y);
        imagesavealpha($im, true);
        $alpha = imagecolorallocatealpha($im, 0, 0, 0, 127);
        imagefill($im, 0, 0, $alpha);

        $i = 0;
        foreach ($this->files as $key => $file) {
            $im2 = imagecreatefrompng($this->folder . '/' . $file);
            imagecopy($im, $im2, ($this->x * $i), 0, 0, 0, $this->x, $this->y);
            $i++;
        }
        imagepng($im, $this->output . '.png');
        imagedestroy($im);
    }
}

$sprite = new sprite('sprite', 'idle', 1372, 1347);