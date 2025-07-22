*This program used to extract the used fields from the report file.
*Parameter : tcReportFile - frx file name 
LPARAMETERS tcReportFile
lcReportfile=tcReportFile
lcAlias = ALIAS()
*Copy the current alias field names into a temporary table
SELECT (lcAlias)
COPY STRUCTURE EXTENDED TO cTemp.dbf

SELECT 0
USE cTemp 

*Create cursors for holding temporary data
CREATE CURSOR Fcursor(Fieldname c(254), XFieldName c(254))  
CREATE CURSOR FFinal(Fieldname c(254))  

SELECT 0
USE (lcReportFile) alias RepFile
GO top

*Add variables and fields to the output
SELECT lefT(expr,254) as FieldName FROM RepFile ;
	WHERE INLIST(objtype, 6, 7, 8, 17) AND !empt(Expr) INTO CURSOR ac_bands 
if Reccount()>0
	Select FCursor
	Appe from DBF('ac_bands')
Endif 

*Replace the characters with blank space.
lcstring = "/()[]*+-%!:.,'"
SELECT FCursor
replace ALL xFieldName WITH FieldName
FOR i = 1 TO LEN(allt(lcstring))
	replace ALL xFieldName WITH chrtran(xFieldName,SUBSTR(lcString,i,1)," ")
ENDFOR 

*!*	*Create defined array to hold FoxPro Reserved words
*!*	DIMENSION laArray[13]
*!*	laArray[1] ="Alltrim"
*!*	laArray[2] ="Allt"
*!*	laArray[3] ="str"
*!*	laArray[4] ="substr"
*!*	laArray[5] ="substring"
*!*	laArray[6] ="val"
*!*	laArray[7] ="IIF"
*!*	laArray[8] ="if"
*!*	laArray[9] = "Round"
*!*	laArray[10] ="ltrim"
*!*	laArray[11] ="rtrim"
*!*	laArray[12] ="trim"
*!*	laArray[13] ="seek"
*!*	*Replace FoxPro Keywords with blank space
*!*	FOR i  = 1 TO alen(laArray)
*!*		replace ALL xFieldName WITH strtran(UPPER(xFieldName),UPPER(allt(laArray[i]))," ")
*!*	ENDFOR 

*The following loop will take each record from Fcusor and idenfity total number of words.
*Loop each word and find whether the word exist as a field name in cTemp Table.
*If exist add the word into Ffinal table as a new record.

SELECT Fcursor
Go top
SCAN
	lnCount = GETWORDCOUNT(xfieldname," ")
	FOR i = 1 TO lnCount
		SELECT cTemp
		GO top
		LOCATE FOR allt(UPPER(Field_Name)	) == UPPER(allt(GETWORDNUM(FCursor.xFieldName,i)))
		IF FOUND()
			SELECT FFinal
			APPEND BLANK
			replace Fieldname WITH allt(GETWORDNUM(FCursor.xFieldName,i))
		ENDIF
	ENDFOR
	SELECT FCursor
ENDSCAN

*From FFinal table, collect all the field name and generate records from the main alias() table.
*For this create a dynamic query
SELECT FFinal
IF RECCOUNT()>0
	GO Top
	lcString = "Select "
	SCAN
		lcString = lcString + allt(FieldName)+ ","
	ENDSCAN
	lcString = left(allt(lcString),LEN(allt(lcString))-1)
	lcString = lcString + " From "+ DBF(lcAlias) + " into Cursor ReportCursor "
	
	&lcstring
	
	SELECT ReportCursor

	COPY TO RepDetail TYPE  xls 
ENDIF 
SELECT FFinal
lnFCount=FCOUNT()

*Formatting the Excel sheet through Excel Automation
lcFile = FULLPATH(CURDIR())+"RepDetail.xls"
lcOutFile = FULLPATH(CURDIR())+"FinalReport"
IF File(lcFile)
	loExcel = CREATEOBJECT("Excel.Application")
	oWorkBook = loExcel.Workbooks.Open(lcFile)
	loexcel.DisplayAlerts = .F.	&& Supress the alert messages from Excel.
	
	loExcel.WindowState= -4137  && xlMaximized
	oCurrentSheet=oWorkbook.ActiveSheet
	oCurrentSheet.UsedRange.Columns.AutoFit
	
	oCurrentSheet.Rows("1:2").Insert(-4121)	&& Adding 2 blank row before 1st row
	
	*Merging First row and adding heading and formating
	oCurrentSheet.Rows(1).EntireRow.Merge
	oCurrentSheet.Cells(1,1).Value = "Sample Report"
	oCurrentSheet.Rows(1).Font.Name="Arial"
	oCurrentSheet.Rows(1).Font.FontStyle="Bold"
	oCurrentSheet.Rows(1).Font.Size=12
	oCurrentSheet.Rows(3).Font.Name="Arial"
	oCurrentSheet.Rows(3).Font.FontStyle="Bold"
	oCurrentSheet.Rows(3).Font.Size=10
	oCurrentSheet.UsedRange.Borders.Linestyle = 1
	loExcel.Application.ActiveWorkbook.SaveAs(lcOutFile)
	loExcel.quit
	oCurrentSheet=NULL
ENDIF 

USE IN ('ctemp')
USE IN ('FFinal')
USE IN ('ReportCursor')
USE IN ('FCursor')
SELECT (lcAlias)
USE IN ('RepFile') 
return