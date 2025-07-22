SET EXCL off
SET CENT on
SET DELE on
SET TALK off
SET SAFE off
SET MULT on
SET TABLEVALIDATE TO 2
SET TABLEPROMPT off
Set Sysmenu Off
RELEASE WINDOWS standard


*!*	_screen.Caption = 'Employee Management System'
*!*	_screen.MaxHeight = 520   && 610
*!*	_screen.MaxWidth  = 560
*!*	_screen.Height = 520
*!*	_screen.Width  = 560
*!*	*_screen.Icon = 'D:\MACUTIL\MULTIDOC.ICO'
*!*	_screen.AutoCenter = .t.
*!*	_screen.TitleBar = 0 
*!*	_screen.BackColor = RGB(137,165,237)
*!*	_screen.WindowType= 1
*!*	_screen.BorderStyle= 2  
*!*	SET DEFAULT TO (ADDBS(JUSTPATH(SYS(16))))
ss = (ADDBS(JUSTPATH(SYS(16))))
*!*	SET DEFAULT TO (LEFT(CURDIR(),AT("P",CURDIR())-1))
SET DEFAULT TO (ss)
SET PATH TO forms;libs;prgs;bmps;data;reports;

*!*	open database employee
_screen.Visible= .F.
DO FORM empsearch 
SET EXACT off
READ EVENTS

PROCEDURE confirmquit

IF MESSAGEBOX('Close the Program', 36, 'Please Confirm') = 6
	RETURN
ELSE
	CLEAR EVENTS
	RETURN
ENDIF

