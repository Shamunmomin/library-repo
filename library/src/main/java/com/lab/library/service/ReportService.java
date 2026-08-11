package com.lab.library.service;

import com.lab.library.entity.*;
import com.lab.library.enums.AllocationStatus;
import com.lab.library.enums.SubscriptionPackage;
import com.lab.library.exception.BadRequestException;
import com.lab.library.repository.*;
import com.lab.library.enums.FeeStatus;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final UserService userService;
    private final LibraryService libraryService;
    private final SubscriptionService subscriptionService;
    private final MemberRepository memberRepository;
    private final SeatRepository seatRepository;
    private final SeatAllocationRepository seatAllocationRepository;
    private final FloorRepository floorRepository;
    private final PaymentRepository paymentRepository;

    public byte[] generatePaymentReport(UUID userId, LocalDate startDate, LocalDate endDate) {
        checkProAccess(userId);
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);
        List<Member> members = memberRepository.findByLibraryAndArchivedFalseAndJoinDateBetweenOrderByJoinDateAsc(library, startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            addTitle(document, "Payment Report", library, startDate, endDate);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            addTableHeader(table, "Name", "Phone", "Fee Amount", "Fee Status", "Join Date");

            for (Member m : members) {
                addTableCell(table, m.getName(), m.getPhone(),
                        m.getFeeAmount() != null ? "Rs." + m.getFeeAmount().toString() : "Rs.0",
                        m.getFeeStatus().name(),
                        m.getJoinDate() != null ? m.getJoinDate().toString() : "-");
            }

            document.add(table);
            addSummary(document, members);
            document.close();
        } catch (Exception e) {
            log.error("Error generating payment report", e);
            throw new RuntimeException("Failed to generate payment report", e);
        }

        log.info("Payment report generated for user: {}", user.getEmail());
        return baos.toByteArray();
    }

    public byte[] generateMemberReport(UUID userId) {
        checkProAccess(userId);
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);
        List<Member> members = memberRepository.findByLibraryAndArchivedFalseOrderByNameAsc(library);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());
        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            addTitle(document, "Member Report", library, null, null);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            addTableHeader(table, "Name", "Email", "Phone", "Address", "Fee Amount", "Fee Status", "Join Date");

            for (Member m : members) {
                addTableCell(table, m.getName(), m.getEmail() != null ? m.getEmail() : "-",
                        m.getPhone(), m.getAddress() != null ? m.getAddress() : "-",
                        m.getFeeAmount() != null ? "Rs." + m.getFeeAmount().toString() : "Rs.0",
                        m.getFeeStatus().name(),
                        m.getJoinDate() != null ? m.getJoinDate().toString() : "-");
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            log.error("Error generating member report", e);
            throw new RuntimeException("Failed to generate member report", e);
        }

        log.info("Member report generated for user: {}", user.getEmail());
        return baos.toByteArray();
    }

    public byte[] generateUtilizationReport(UUID userId) {
        checkProAccess(userId);
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);
        List<Floor> floors = floorRepository.findByLibraryOrderByCreatedAtAsc(library);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            addTitle(document, "Seat Utilization Report", library, null, null);

            for (Floor floor : floors) {
                document.add(new Paragraph("Floor: " + floor.getName(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
                document.add(new Paragraph(" "));

                long total = seatRepository.countByFloor(floor);
                long occupied = seatRepository.countByFloorAndStatus(floor, com.lab.library.enums.SeatStatus.OCCUPIED);
                long available = total - occupied;

                PdfPTable table = new PdfPTable(3);
                table.setWidthPercentage(100);
                addTableHeader(table, "Total Seats", "Occupied", "Available");
                addTableCell(table, String.valueOf(total), String.valueOf(occupied), String.valueOf(available));

                document.add(table);
                document.add(new Paragraph(" "));
            }

            document.close();
        } catch (Exception e) {
            log.error("Error generating utilization report", e);
            throw new RuntimeException("Failed to generate utilization report", e);
        }

        log.info("Utilization report generated for user: {}", user.getEmail());
        return baos.toByteArray();
    }

    public byte[] generateAdminPaymentReport(LocalDate startDate, LocalDate endDate) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Paragraph titlePara = new Paragraph("Platform Payment Report", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18));
            titlePara.setAlignment(Element.ALIGN_CENTER);
            titlePara.setSpacingAfter(4f);
            document.add(titlePara);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MMMM-yyyy");
           String formattedStartDate = startDate.format(formatter);
           String formattedEndDate = endDate.format(formatter);

            Paragraph datePara = new Paragraph("Period: " +formattedStartDate + " to " + formattedEndDate,
                    FontFactory.getFont(FontFactory.HELVETICA, 10));
            datePara.setAlignment(Element.ALIGN_CENTER);
            document.add(datePara);
            document.add(new Paragraph(" "));

            List<Payment> payments = paymentRepository.findByPaymentDateBetweenOrderByPaymentDateDesc(
                    startDate.atStartOfDay(), endDate.atTime(java.time.LocalTime.MAX));
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            addTableHeader(table, "User Name","Phone", "Amount","Subscription", "Status", "Payment Date");

            for (Payment p : payments) {
                addTableCell(table,
                        p.getUser() != null ? p.getUser().getName() : "-",
                        p.getUser() != null ? p.getUser().getPhone() : "-",
                        p.getAmount() != null ? "Rs." + p.getAmount().toString() : "Rs.0",
                        p.getSubscriptionType() != null ? p.getSubscriptionType().name() : "-",
                        p.getStatus().name(),
                        p.getPaymentDate() != null ? p.getPaymentDate().toLocalDate().toString(): "-");
//                        p.getSubscriptionEndDate() != null ? p.getSubscriptionEndDate().toLocalDate().toString(): "-");
            }

            document.add(table);

            BigDecimal total = payments.stream()
                    .filter(p -> p.getStatus() == com.lab.library.enums.PaymentStatus.COMPLETED && p.getAmount() != null)
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Paragraph summary = new Paragraph();
            summary.add(new Chunk("\nTotal Completed Payments: Rs." + total.toString(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
            document.add(summary);

            document.close();
        } catch (Exception e) {
            log.error("Error generating admin payment report", e);
            throw new RuntimeException("Failed to generate admin payment report", e);
        }

        log.info("Admin payment report generated");
        return baos.toByteArray();
    }

    private void checkProAccess(UUID userId) {
        SubscriptionPackage pkg = subscriptionService.getUserActivePackage(userId);
        if (pkg == null || pkg != SubscriptionPackage.PRO) {
            throw new BadRequestException("PDF reports are only available for Pro plan subscribers");
        }
    }

    private void addTitle(Document document, String title, Library library, LocalDate startDate, LocalDate endDate) throws DocumentException {
        Paragraph titlePara = new Paragraph(title, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18));
        titlePara.setAlignment(Element.ALIGN_CENTER);
        document.add(titlePara);

        Paragraph libPara = new Paragraph("Library: " + library.getName(), FontFactory.getFont(FontFactory.HELVETICA, 12));
        libPara.setAlignment(Element.ALIGN_CENTER);
        document.add(libPara);

        if (startDate != null && endDate != null) {
            Paragraph datePara = new Paragraph("Period: " + startDate.format(DateTimeFormatter.ISO_LOCAL_DATE) + " to " + endDate.format(DateTimeFormatter.ISO_LOCAL_DATE),
                    FontFactory.getFont(FontFactory.HELVETICA, 10));
            datePara.setAlignment(Element.ALIGN_CENTER);
            document.add(datePara);
        }

        document.add(new Paragraph(" "));
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(5);
            table.addCell(cell);
        }
    }

    private void addTableCell(PdfPTable table, String... cells) {
        for (String cell : cells) {
            PdfPCell pdfCell = new PdfPCell(new Phrase(cell != null ? cell : "", FontFactory.getFont(FontFactory.HELVETICA, 9)));
            pdfCell.setPadding(4);
            table.addCell(pdfCell);
        }
    }

    private void addSummary(Document document, List<Member> members) throws DocumentException {
        document.add(new Paragraph(" "));
        long paid = members.stream().filter(m -> m.getFeeStatus() == FeeStatus.PAID).count();
        long unpaid = members.stream().filter(m -> m.getFeeStatus() == FeeStatus.UNPAID).count();
        long partial = members.stream().filter(m -> m.getFeeStatus() == FeeStatus.PARTIAL).count();
        BigDecimal totalPaid = members.stream()
                .filter(m -> m.getFeeStatus() == FeeStatus.PAID && m.getFeeAmount() != null)
                .map(Member::getFeeAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Paragraph summary = new Paragraph();
        summary.add(new Chunk("Summary:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
        summary.add(new Chunk("\nPaid: " + paid + " | Unpaid: " + unpaid + " | Partial: " + partial, FontFactory.getFont(FontFactory.HELVETICA, 10)));
        summary.add(new Chunk("\nTotal Collected: Rs." + totalPaid.toString(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        document.add(summary);
    }
}
