*-- The First parameter is the path to the frx or lbx file
*-- The Second is the name of the text file you want generated
LPARAMETER pc_frx, pc_txt
SET ASSERTS ON
ASSERT .f.
*-- Determins if order by (expression) vs (top to left)
#DEFINE cl_OrderByExpr .f.

*-- Change this to force pixels or inches or report default
#DEFINE cc_Dimension   "Report"
*#DEFINE cc_Dimension   "Pixels"
*#DEFINE cc_Dimension   "Inches"

LOCAL ln_fhndl, ln_indent, ln_cntr, ln_bands, ll_delete, ln_convert, ;
      ln_height, lc_band, ln_count, ln_cnt, ln_area, ll_pixels, ln_dec
LOCAL ARRAY la_bands[1]

#DEFINE cn_objcode       1
#DEFINE cn_uniqueid      2
#DEFINE cn_height        3
#DEFINE cn_width         4
#DEFINE cn_vpos          5
#DEFINE cn_hpos          6
#DEFINE cn_expr          7
#DEFINE cn_tag           8
#DEFINE cn_tag2          9
#DEFINE cn_plain        10
#DEFINE cn_pagebreak    11
#DEFINE cn_colbreak     12
#DEFINE cn_resetpage    13
#DEFINE cn_norepeat     14

*-- These values are Assumptions
#DEFINE cn_PixConvert   (10000 / 96)
#DEFINE cn_IncConvert   (10000)
#DEFINE cn_BandHeight   (2083 + (1/3))
#DEFINE cn_StartPos     (1979 + (1/6))

ll_delete  = (SET('DELETED') = "ON")
ln_area    = SELECT(0)
ln_fhndl   = -1
ln_indent  = 0
ln_bands   = 0
ln_cntr    = 0
ln_height  = -cn_BandHeight
ln_count   = 0
ln_cnt     = 0
ln_convert = 0
ll_pixels  = .f.
ln_dec     = 0

IF TYPE('pc_frx') <> "C"
   pc_frx = GETFILE('frx')
ENDIF

IF TYPE('pc_frx') = "C"
   SELECT 0
   IF .NOT. ll_delete
      SET DELETED ON
   ENDIF

   DO CASE
      CASE FILE(pc_frx)
         USE (pc_frx) ALIAS a_report
      CASE FILE(pc_frx + ".frx")
         USE (pc_frx + ".frx") ALIAS a_report
         pc_frx = pc_frx + ".frx"
      CASE FILE(pc_frx + ".lbx")
         USE (pc_frx + ".lbx") ALIAS a_report
         pc_frx = pc_frx + ".lbx"
   ENDCASE

   *-- Continue if the file was opened
   IF USED('a_report')
      IF TYPE('pc_txt') <> "C"
         pc_txt = ADDBS(SYS(2023)) + "0" + ;
                  RIGHT(SYS(2015), 3) + ;
                  RIGHT(SYS(3), 3) + "9.txt"
      ENDIF

      *-- Select out all the report bands into an array
      SELECT objcode, uniqueid, height, width, vpos, hpos, expr, tag, tag2, ;
             plain, pagebreak, colbreak, resetpage, norepeat ;
         FROM a_report WHERE objtype = 9 ORDER BY objcode INTO ARRAY la_bands

      *-- See how many group footers we have
      SELECT a_report
      COUNT TO ln_group FOR objtype = 9 AND objcode = 5

      ln_group = ln_group + 1
      ln_bands = ALEN(la_bands, 1)
      FOR ln_cntr = 1 TO ln_bands
         IF la_bands[ln_cntr, cn_objcode] = 5
            ln_group = ln_group - 1
            IF EMPTY(la_bands[ln_cntr, cn_expr])
               *-- Find the expression from the group header
               SELECT TOP ln_group expr, RECNO() AS _recno_ ;
                  WHERE objtype = 9 AND objcode = 3 FROM a_report ;
                  ORDER BY _recno_ INTO CURSOR ac_group
               GO BOTTOM
               IF RECCOUNT() = ln_group
                  la_bands[ln_cntr, cn_expr] = ac_group->expr
               ENDIF
               USE IN ac_group
            ENDIF
         ENDIF

         *-- Add the headers together to get the object heights
         ln_height = ln_height + la_bands[ln_cntr, cn_height] + cn_BandHeight
         la_bands[ln_cntr, cn_height] = ln_height
      ENDFOR

      *-- Write Header info
      ln_fhndl = FCREATE(pc_txt)

      SELECT a_report
      LOCATE FOR objtype = 1

      *-- Grab the report default
      ll_pixels = .NOT. (ruler = 1)

      *-- Does the user want to force dimension to pixels?
      IF cc_Dimension = "Pixels"
         ll_pixels = .t.
      ENDIF

      *-- Does the user want to force dimension to inches?
      IF cc_Dimension = "Inches"
         ll_pixels = .f.
      ENDIF

      *-- Set up conversion factors
      IF ll_pixels
         ln_convert = cn_PixConvert
         ln_dec     = 0
      ELSE
         ln_convert = cn_IncConvert 
         ln_dec     = 2
      ENDIF

      *-- Write header of file to output file
      =FPUTS(ln_fhndl, '**************************************************')
      =FPUTS(ln_fhndl, '*-- ' + IIF(UPPER(JUSTEXT(pc_frx)) = "LBX", 'Label:','Report:') + ;
                       '   ' + JUSTSTEM(pc_frx) + '  {' + FULLPATH(pc_frx) + '}')
      =FPUTS(ln_fhndl, '*   [Positions giving in ' + IIF(ll_pixels, 'Pixels','Inches') + ']')
      =FPUTS(ln_fhndl, '**************************************************')
      =FPUTS(ln_fhndl, SPACE(0))

      *-- Load in the report aspects
      IF UPPER(JUSTEXT(pc_frx)) = "LBX"
         =FPUTS(ln_fhndl, 'LABEL FORM ' + JUSTSTEM(pc_frx) + '')
      ELSE
         =FPUTS(ln_fhndl, 'REPORT FORM ' + JUSTSTEM(pc_frx) + '')
      ENDIF
      =FPUTS(ln_fhndl, SPACE(0))
      ln_indent = ln_indent + 3

      *-- If the report has columns write the column information
      IF vpos > 1
        =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Columns = ' + LTRIM(PADL(vpos, 12)))
        =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Spacing = ' + LTRIM(PADL(height / ln_convert, 12)))
        =FPUTS(ln_fhndl, SPACE(ln_indent) + 'PrintOrder = ' + ;
                         IIF(bottom, 'Left-To-Right', 'Top-To-Bottom'))
      ENDIF
      =FPUTS(ln_fhndl, SPACE(ln_indent) + 'LeftMargin = ' + LTRIM(PADL(hpos / ln_convert, 12)))
      =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Width = ' + LTRIM(PADL(width / ln_convert, 12)))

      *-- Add in the fonts
      DO l_font with ln_fhndl, ln_indent
      =FPUTS(ln_fhndl, SPACE(0))

      * Add variables to the output
      *-- Need to select out information from the table 
      SELECT *, PADR(name, 254) AS x FROM a_report ;
         WHERE objtype = 18 INTO CURSOR ac_bands ORDER BY x, vpos, hpos
      IF _Tally > 0
        =FPUTS(ln_fhndl, SPACE(ln_indent) + '*-- REPORT VARS')

        SCAN
          =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Name = ' + name)
          *-- Write Properties for the variable
          =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Expression = ' + expr)
          =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Value = ' + tag)
           *-- Release after report
           IF unique
              =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Release = .T.')
           ENDIF
           *-- What calculation to do
           IF totaltype <> 0
              =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Calculation = ' + ;
                               IIF(totaltype = 1, 'Count', ;
                               IIF(totaltype = 2, 'Sum', ;
                               IIF(totaltype = 3, 'Avg', ;
                               IIF(totaltype = 4, 'Lowest', ;
                               IIF(totaltype = 5, 'Highest', ;
                               IIF(totaltype = 6, 'Std Deviation', ;
                               IIF(totaltype = 7, 'Variance', ;
                               'Unknown'))))))))
           ENDIF
           *-- When to reset totals
           DO CASE 
              CASE resettotal = 1
                 =FPUTS(ln_fhndl, SPACE(ln_indent) + 'reset = EndOfReport')
              CASE resettotal = 2
                 =FPUTS(ln_fhndl, SPACE(ln_indent) + 'reset = EndOfPage')
              CASE resettotal = 3
                 =FPUTS(ln_fhndl, SPACE(ln_indent) + 'reset = EndOfColumn')
              CASE resettotal = 0
              CASE resettotal > 5
                *-- Find out what group to reset on
                ln_count = 0
                FOR ln_cntr = 1 TO ln_bands
                   IF la_bands[ln_cntr, cn_objcode] = 3
                      ln_count = ln_count + 1
                      IF ln_count = (resettotal - 5)
                         =FPUTS(ln_fhndl, SPACE(ln_indent) + 'reset = [' + ;
                                          la_bands[ln_cntr, cn_expr] + "] changes")
                      ENDIF
                   ENDIF
                ENDFOR
           ENDCASE
           =FPUTS(ln_fhndl, SPACE(0))
         ENDSCAN
      ENDIF && IF _Tally > 0

      USE IN ac_bands

      =FFLUSH(ln_fhndl)

      ln_height = 0
      IF ln_bands > 0

         *-- Loop though the bands and grab the objects with in them
         FOR ln_cntr = 1 TO ln_bands
            *-- Find the current report band in the report table
            SELECT a_report
            LOCATE FOR uniqueid = la_bands[ln_cntr, cn_uniqueid]

            =FPUTS(ln_fhndl, SPACE(ln_indent) + '*-- REPORT BAND')
            lc_band = IIF(la_bands[ln_cntr, cn_objcode] = 0, 'Title', ;
                      IIF(la_bands[ln_cntr, cn_objcode] = 1, 'PageHeader', ;
                      IIF(la_bands[ln_cntr, cn_objcode] = 2, 'ColumnHeader', ;
                      IIF(la_bands[ln_cntr, cn_objcode] = 3, 'GroupHeader', ;
                      IIF(la_bands[ln_cntr, cn_objcode] = 4, 'Detail', ;
                      IIF(la_bands[ln_cntr, cn_objcode] = 5, 'GroupFooter', ;
                      IIF(la_bands[ln_cntr, cn_objcode] = 6, 'ColumnFooter', ;
                      IIF(la_bands[ln_cntr, cn_objcode] = 7, 'PageFooter', ;
                      IIF(la_bands[ln_cntr, cn_objcode] = 8, 'Summary', ;
                          'Unknown')))))))))

           =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Band = ' + lc_band)
*           =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Top = ' + LTRIM(PADL(ln_height / ln_convert, 12)))
           =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Height = ' + ;
                            LTRIM(PADL(a_report->height / ln_convert, 12)))
           IF .NOT. EMPTY(la_bands[ln_cntr, cn_expr])
              =FPUTS(ln_fhndl, SPACE(ln_indent) + 'GroupBy = ' + la_bands[ln_cntr, cn_expr])
           ENDIF
           IF la_bands[ln_cntr, cn_pagebreak]
              =FPUTS(ln_fhndl, SPACE(ln_indent) + 'NewPageOnGroupChange = .T.')
           ENDIF
           IF la_bands[ln_cntr, cn_colbreak]
              =FPUTS(ln_fhndl, SPACE(ln_indent) + 'NewColumnOnGroupChange = .T.')
           ENDIF
           IF la_bands[ln_cntr, cn_resetpage]
              =FPUTS(ln_fhndl, SPACE(ln_indent) + 'NewPageNumberOnGroupChange = .T.')
           ENDIF
           IF la_bands[ln_cntr, cn_norepeat]
              =FPUTS(ln_fhndl, SPACE(ln_indent) + 'ReprintGroupHeaderOnNewPage = .T.')
           ENDIF
           IF la_bands[ln_cntr, cn_width] <> 0
              =FPUTS(ln_fhndl, SPACE(ln_indent) + 'HeightToStartNewGroup = ' + ;
                                                   LTRIM(PADL(la_bands[ln_cntr, cn_width], 12)))
           ENDIF
           IF .NOT. EMPTY(la_bands[ln_cntr, cn_tag])
              =FPUTS(ln_fhndl, SPACE(ln_indent) + 'OnEntry = ' + la_bands[ln_cntr, cn_tag])
           ENDIF
           IF .NOT. EMPTY(la_bands[ln_cntr, cn_tag2])
              =FPUTS(ln_fhndl, SPACE(ln_indent) + 'OnExit = ' + la_bands[ln_cntr, cn_tag2])
           ENDIF
           IF la_bands[ln_cntr, cn_plain]
              =FPUTS(ln_fhndl, SPACE(ln_indent) + 'ConstantHeight = .T.')
           ENDIF

           *-- Need to select out information from the table
           IF cl_OrderByExpr
              SELECT *, PADR(expr, 254) AS x FROM a_report ;
                 WHERE BETWEEN(vpos, ROUND(ln_height, 3) + IIF(ln_cntr = 1, 0, .0001), ;
                                     ROUND(la_bands[ln_cntr, cn_height], 3)) .AND. ;
                 INLIST(objtype, 5, 6, 7, 8, 17) INTO CURSOR ac_bands ;
                 ORDER BY objtype, x, vpos, hpos
           ELSE
              SELECT *, PADR(expr, 254) AS x FROM a_report ;
                 WHERE BETWEEN(vpos, ROUND(ln_height, 3) + IIF(ln_cntr = 1, 0, .0001), ;
                                     ROUND(la_bands[ln_cntr, cn_height], 3)) .AND. ;
                 INLIST(objtype, 5, 6, 7, 8, 17) INTO CURSOR ac_bands ;
                 ORDER BY objtype, vpos, hpos, x
           ENDIF

           SELECT ac_bands
           IF RECCOUNT() = 0
              =FPUTS(ln_fhndl, SPACE(0))
           ELSE
              ln_indent = ln_indent + 3

              SCAN
                 =FPUTS(ln_fhndl, SPACE(0))
                 DO CASE
                    CASE objtype = 8
                      *-- TextBox
                      =FPUTS(ln_fhndl, SPACE(ln_indent) + '*-- TextBox')
                      =FPUTS(ln_fhndl, SPACE(ln_indent) + 'expr = ' + expr)
                      =FPUTS(ln_fhndl, SPACE(ln_indent) + 'inputmask = ' + picture)
                      =FPUTS(ln_fhndl, SPACE(ln_indent) + 'type = ' + fillchar)
                      IF stretch
                         =FPUTS(ln_fhndl, SPACE(ln_indent) + 'stretch = .T.')
                      ENDIF
                      DO CASE
                         CASE offset = 0
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Align = Left')
                         CASE offset = 1
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Align = Right')
                         CASE offset = 2
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'Align = Center')
                      ENDCASE

                    CASE objtype = 5
                      *-- Label
                      =FPUTS(ln_fhndl, SPACE(ln_indent) + '*-- Label')
                      =FPUTS(ln_fhndl, SPACE(ln_indent) + 'caption = ' + expr)
                      DO CASE
                         CASE spacing = 1
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'caption = 1.5')
                         CASE spacing = 2
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'spacing = Double')
                      ENDCASE

                   CASE objtype = 6
                      *-- Line
                      =FPUTS(ln_fhndl, SPACE(ln_indent) + '*-- Line')
                      DO CASE 
                         CASE stretch
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'stretch = Heightofband')
                         CASE stretchtop
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'stretch = TallesObject')
                      ENDCASE
                      IF offset = 0
                         =FPUTS(ln_fhndl, SPACE(ln_indent) + 'orientation = Vertical')
                      ELSE
                         =FPUTS(ln_fhndl, SPACE(ln_indent) + 'orientation = Horizontal')
                      ENDIF
   
                   CASE objtype = 7
                      *-- circles and boxes
                      =FPUTS(ln_fhndl, SPACE(ln_indent) + '*-- Shape')
                      =FPUTS(ln_fhndl, SPACE(ln_indent) + 'curvature = ' + LTRIM(PADL(offset, 3)))
                      DO CASE 
                         CASE stretch
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'stretch = Heightofband')
                         CASE stretchtop
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'stretch = TallesObject')
                      ENDCASE
   
                   CASE objtype = 17
                      *-- pictures and ole and general fields
                      =FPUTS(ln_fhndl, SPACE(ln_indent) + '*-- Picture or OleControl')
                      IF offset = 0
                         =FPUTS(ln_fhndl, SPACE(ln_indent) + 'file = ' + picture)
                      ELSE
                         =FPUTS(ln_fhndl, SPACE(ln_indent) + 'controlsource = ' + name)
                      ENDIF
                      IF double
                         =FPUTS(ln_fhndl, SPACE(ln_indent) + 'center = .T.')
                      ENDIF
                      DO CASE 
                         CASE general = 0
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'stretch = clip')
                         CASE general = 1
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'stretch = retainshape')
                         CASE general = 2
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'stretch = fillframe')
                      ENDCASE
                 ENDCASE

                 *-- These properties are the same for all report objects
                 =FPUTS(ln_fhndl, SPACE(ln_indent) + 'top = ' + ;
                                  LTRIM(STR((vpos - (ln_height + ;
                                    IIF(ln_cntr = 1, 0, cn_BandHeight))) / ln_convert, ;
                                        6 + ln_dec, ln_dec)))
                 =FPUTS(ln_fhndl, SPACE(ln_indent) + 'left = ' + ;
                                  LTRIM(STR(hpos / ln_convert, 6 + ln_dec, ln_dec)))
                 =FPUTS(ln_fhndl, SPACE(ln_indent) + 'height = ' + ;
                                  LTRIM(STR(height / ln_convert, 6 + ln_dec, ln_dec)))
                 =FPUTS(ln_fhndl, SPACE(ln_indent) + 'width = ' + ;
                                  LTRIM(STR(width / ln_convert, 6 + ln_dec, ln_dec)))
                 IF .NOT. supalways
                    =FPUTS(ln_fhndl, SPACE(ln_indent) + 'repeatvalues = .F.')
                 ENDIF
                 IF norepeat
                    =FPUTS(ln_fhndl, SPACE(ln_indent) + 'removeblanks = .T.')
                 ENDIF
                 IF .NOT. EMPTY(supexpr)
                    =FPUTS(ln_fhndl, SPACE(ln_indent) + 'printwhen = ' + supexpr)
                 ENDIF
                 IF supovflow
                    =FPUTS(ln_fhndl, SPACE(ln_indent) + 'reprint = detailoverflow')
                 ENDIF
                 IF supgroup = 3
                    =FPUTS(ln_fhndl, SPACE(ln_indent) + 'reprint = firstwholeband')
                 ENDIF
                 IF supgroup > 5
                    ln_count = 0
                    FOR ln_cnt = 1 TO ln_bands
                      IF la_bands[ln_cnt, cn_objcode] = 3
                         ln_count = ln_count + 1
                         IF ln_count = (supgroup - 5)
                            =FPUTS(ln_fhndl, SPACE(ln_indent) + 'reprint = [' + ;
                                             la_bands[ln_cnt, cn_expr] + "] changes")
                         ENDIF
                      ENDIF
                    ENDFOR
                 ENDIF
                 =FPUTS(ln_fhndl, SPACE(ln_indent) + 'position = ' + ;
                                  IIF(top, 'Top', ;
                                  IIF(bottom, 'Bottom', ;
                                  IIF(float, 'Float', ;
                                  'Relative'))))

                 DO l_font WITH ln_fhndl, ln_indent
              ENDSCAN
              ln_indent = ln_indent - 3
           ENDIF

           USE IN ac_bands

           =FPUTS(ln_fhndl, SPACE(0))

           ln_height = la_bands[ln_cntr, cn_height]
         ENDFOR
      ENDIF

      =FPUTS(ln_fhndl, '**************************************************')
      =FCLOSE(ln_fhndl)

      USE IN a_report
   ENDIF

   IF .NOT. ll_delete
      SET DELETED OFF
   ENDIF

ENDIF
SELECT (ln_area)
RETURN


FUNCTION l_font
LPARAMETER pn_hndl, pn_indent
LOCAL ln_style

IF .NOT. EMPTY(comment + SPACE(0))
   =FPUTS(pn_hndl, SPACE(pn_indent) + 'Comment = ' + comment)
ENDIF

IF .NOT. EMPTY(fontface)
   =FPUTS(pn_hndl, SPACE(pn_indent) + 'FontName = ' + fontface)
ENDIF

IF fontsize > 0
   =FPUTS(pn_hndl, SPACE(pn_indent) + 'FontSize = ' + LTRIM(PADL(fontsize, 3)))
ENDIF

IF fillred + fillblue + fillgreen > 0
   =FPUTS(pn_hndl, SPACE(pn_indent) + 'BackColor = RGB(' + PADL(fillred, 3, '0') + "," + ;
                   PADL(fillgreen, 3, '0') + "," + PADL(fillblue, 3, '0') + ")")
ENDIF

IF penred + penblue + pengreen > 0
   =FPUTS(pn_hndl, SPACE(pn_indent) + 'ForeColor = RGB(' + PADL(penred, 3, '0') + "," + ;
                   PADL(pengreen, 3, '0') + "," + PADL(penblue, 3, '0') + ")")
ENDIF

IF .NOT. ISBLANK(pensize)
   =FPUTS(pn_hndl, SPACE(pn_indent) + 'BorderWidth = ' + LTRIM(PADL(pensize, 5)))
ENDIF

IF .NOT. ISBLANK(penpat)
   =FPUTS(pn_hndl, SPACE(pn_indent) + 'BorderStyle = ' + LTRIM(PADL(penpat, 5)))
ENDIF

IF .NOT. ISBLANK(fillpat)
   =FPUTS(pn_hndl, SPACE(pn_indent) + 'FillStyle = ' + LTRIM(PADL(fillpat, 5)))
ENDIF

IF .NOT. ISBLANK(mode)
   =FPUTS(pn_hndl, SPACE(pn_indent) + 'BackStyle = ' + IIF(mode <> 1, 'Opaque', 'Transparent'))
ENDIF

IF fontstyle <> 0
   ln_style = fontstyle
   IF ln_style - 128 >= 0
      =FPUTS(pn_hndl, SPACE(pn_indent) + 'FontStrikethru = .T.')
      ln_style = ln_style - 128
   ENDIF
   IF ln_style - 4 >= 0
      =FPUTS(pn_hndl, SPACE(pn_indent) + 'FontUnderline = .T.')
      ln_style = ln_style - 4
   ENDIF
   IF ln_style - 2 >= 0
      =FPUTS(pn_hndl, SPACE(pn_indent) + 'FontItalic = .T.')
      ln_style = ln_style - 2
   ENDIF
   IF ln_style - 1 >= 0
      =FPUTS(pn_hndl, SPACE(pn_indent) + 'FontBold = .T.')
      ln_style = ln_style - 1
   ENDIF
ENDIF

RETURN