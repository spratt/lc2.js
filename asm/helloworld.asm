;;; helloworld.asm
;;; Purpose: prints "Hello, world!" and halts

        ;; set the start address to 3000 (in hex)
        .orig   $3000
        ;; load the address of myStr into register 0
        lea     r0, myStr
        ;; write the string to the console
        puts
        ;; halt the computer
        halt

myStr:  .stringz "Hello, world!"
