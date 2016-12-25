;;; Welcome to the Assembly Editor.  In this text area, you can write
;;; LC-2 assembly code and it (should be) nicely highlighted.

;;; If you click the button below that is labeled "Assemble", this code will be
;;; assembled into bytecode and loaded into the LC-2 simulator whose state is
;;; shown below.

;;; On the right side of the LC-2 state, there is a button labeled "Step."
;;; Clicking on this button executes the code at the address stored in the PC
;;; register.

        ;; set the start address to 3000 (in hex)
        .orig   $3000
        ;; load the address of myStr into register 0
        lea     r0, myStr
        ;; write the string to the console
        puts
        ;; halt the computer
        halt

;;; store the zero-terminated string "Hello, world!" in memory
;;; and use the myStr label to refer to its address
myStr:  .stringz "Hello, world!"
