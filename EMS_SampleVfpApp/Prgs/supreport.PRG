WAIT WIND "Processing Report, Please Wait..." NOWAIT

IF NOT USED('supplier')
	SELECT 0
	USE supplier
ENDIF

SELECT * ;
	FROM supplier ;
	INTO CURSOR suplist

	

SELECT SupList

*!*	llScreenVisible = _Screen.Visible
*!*	set sysmenu off
Define Window Output From 1,1 To Scols(),Srows() System Name oOUTPUT Close Zoom
With oOUTPUT
	.Caption = "Supplier List"
	.MaxButton = .T.
	.WindowState = 2
	.Show()
ENDWITH


*!*	_Screen.TitleBar= 0
_Screen.Visible = .T.
_Screen.WindowState = 2

Report Form Suplist.frx Preview Window 'OutPut'

*!*	_Screen.TitleBar= 1
*!*	_Screen.WindowState = 0
*!*	_Screen.Visible = m.llScreenVisible
If Vartype(oOUTPUT) = 'O'
	oOUTPUT.Release()
Endif

*!*	REPORT FORM emplist.frx TO PRINT PROMPT PREVIEW NOCONSOLE 
USE IN IIF(USED("suplist"), "suplist", 0)
