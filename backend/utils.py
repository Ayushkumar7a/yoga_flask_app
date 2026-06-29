import math
import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def calculate_angle(a, b, c):
    """
    Calculates angle ABC using three points:
    a = first point (x,y)
    b = middle joint (x,y)
    c = end point (x,y)
    """
    ax, ay = a
    bx, by = b
    cx, cy = c

    angle = math.degrees(
        math.atan2(cy - by, cx - bx) -
        math.atan2(ay - by, ax - bx)
    )

    if angle < 0:
        angle += 360

    return angle


def generate_pdf_report(username, profile, stats, logs):
    """
    Generates a professional PDF progress report for a user using ReportLab.
    Returns a BytesIO stream containing the PDF data.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom colors
    primary_color = colors.HexColor("#6366f1")    # Indigo
    secondary_color = colors.HexColor("#0f172a")  # Dark slate
    accent_color = colors.HexColor("#10b981")     # Emerald
    text_color = colors.HexColor("#334155")       # Muted slate
    bg_light = colors.HexColor("#f8fafc")         # Warm white/slate-50
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=26,
        textColor=primary_color,
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        textColor=text_color,
        spaceAfter=30
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=16,
        textColor=secondary_color,
        spaceBefore=15,
        spaceAfter=10
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=text_color,
        spaceAfter=8
    )
    
    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    header_cell_style = ParagraphStyle(
        'HeaderCell',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.white
    )
    
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=text_color
    )

    story = []
    
    # 1. Header Section
    story.append(Paragraph("FlexFlow AI — Progress Report", title_style))
    story.append(Paragraph(f"Generated on {datetime_now_str()} for user: <b>{username}</b>", subtitle_style))
    story.append(Spacer(1, 10))
    
    # 2. Profile Summary
    story.append(Paragraph("User Profile Summary", section_heading))
    profile_data = [
        [
            Paragraph("<b>Age:</b>", body_style), 
            Paragraph(str(profile.get('age', 'N/A')) if profile.get('age') else 'N/A', body_style),
            Paragraph("<b>Fitness Level:</b>", body_style),
            Paragraph(profile.get('fitness_level', 'Beginner'), body_style)
        ],
        [
            Paragraph("<b>Height:</b>", body_style),
            Paragraph(f"{profile.get('height', 'N/A')} cm" if profile.get('height') else 'N/A', body_style),
            Paragraph("<b>Focus Goal:</b>", body_style),
            Paragraph(profile.get('goal', 'Flexibility'), body_style)
        ],
        [
            Paragraph("<b>Weight:</b>", body_style),
            Paragraph(f"{profile.get('weight', 'N/A')} kg" if profile.get('weight') else 'N/A', body_style),
            Paragraph("<b>Calculated BMI:</b>", body_style),
            Paragraph(calculate_bmi_str(profile), body_style)
        ]
    ]
    
    profile_table = Table(profile_data, colWidths=[1.2*inch, 2*inch, 1.5*inch, 2.3*inch])
    profile_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f1f5f9")),
    ]))
    story.append(profile_table)
    story.append(Spacer(1, 20))
    
    # 3. Overall Statistics Dashboard
    story.append(Paragraph("Performance Metrics", section_heading))
    duration_min = stats.get('totalTime', 0) // 60
    duration_sec = stats.get('totalTime', 0) % 60
    
    stats_data = [
        [
            Paragraph("<b>Total Sessions</b>", body_bold),
            Paragraph("<b>Practice Streak</b>", body_bold),
            Paragraph("<b>Total Time</b>", body_bold),
            Paragraph("<b>Avg. Accuracy</b>", body_bold),
            Paragraph("<b>Calories Burned</b>", body_bold)
        ],
        [
            Paragraph(str(stats.get('totalSessions', 0)), body_style),
            Paragraph(f"{stats.get('streak', 0)} days", body_style),
            Paragraph(f"{duration_min}m {duration_sec}s", body_style),
            Paragraph(f"{stats.get('accuracy', 0)}%", body_style),
            Paragraph(f"{stats.get('calories', 0)} kcal", body_style)
        ]
    ]
    stats_table = Table(stats_data, colWidths=[1.3*inch, 1.3*inch, 1.4*inch, 1.4*inch, 1.4*inch])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
    ]))
    # Adjust top row text color for header row in table style
    for col in range(5):
        stats_data[0][col].style.textColor = colors.white
        
    story.append(stats_table)
    story.append(Spacer(1, 25))
    
    # 4. History Table
    story.append(Paragraph("Practice History Details", section_heading))
    if not logs:
        story.append(Paragraph("No practice sessions logged yet.", body_style))
    else:
        history_headers = [
            Paragraph("Date / Time", header_cell_style),
            Paragraph("Pose / Flow Name", header_cell_style),
            Paragraph("Reps/Holds", header_cell_style),
            Paragraph("Duration", header_cell_style),
            Paragraph("Avg. Accuracy", header_cell_style)
        ]
        
        history_rows = [history_headers]
        
        # Display max 15 logs to fit nicely on a standard page
        for log in logs[:15]:
            log_date = log.get('timestamp', 'N/A')
            pose_name = log.get('pose_name', 'N/A')
            reps = str(log.get('reps', 0))
            
            d_sec = log.get('duration_seconds', 0)
            d_str = f"{d_sec // 60}m {d_sec % 60}s" if d_sec >= 60 else f"{d_sec}s"
            
            acc = f"{log.get('accuracy', 0)}%"
            
            history_rows.append([
                Paragraph(log_date, table_cell_style),
                Paragraph(pose_name, table_cell_style),
                Paragraph(reps, table_cell_style),
                Paragraph(d_str, table_cell_style),
                Paragraph(acc, table_cell_style)
            ])
            
        history_table = Table(history_rows, colWidths=[1.8*inch, 2.0*inch, 1.0*inch, 1.0*inch, 1.0*inch])
        history_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), secondary_color),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(history_table)
        
    doc.build(story)
    buffer.seek(0)
    return buffer


def datetime_now_str():
    from datetime import datetime
    return datetime.now().strftime("%B %d, %Y - %H:%M")


def calculate_bmi_str(profile):
    h = profile.get('height')
    w = profile.get('weight')
    if h and w:
        try:
            bmi = w / ((h / 100.0) ** 2)
            category = ""
            if bmi < 18.5:
                category = "Underweight"
            elif bmi < 25:
                category = "Normal weight"
            elif bmi < 30:
                category = "Overweight"
            else:
                category = "Obese"
            return f"{bmi:.1f} ({category})"
        except:
            return "N/A"
    return "N/A"