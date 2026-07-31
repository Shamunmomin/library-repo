package com.lab.library.config;

import com.lab.library.dto.StoredImage;
import com.lab.library.entity.Library;
import com.lab.library.entity.Member;
import com.lab.library.entity.Subscription;
import com.lab.library.repository.LibraryRepository;
import com.lab.library.repository.MemberRepository;
import com.lab.library.repository.SubscriptionRepository;
import com.lab.library.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ImageDataMigrationRunner implements ApplicationRunner {

    private final MemberRepository memberRepository;
    private final LibraryRepository libraryRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ImageStorageService imageStorageService;

    @Override
    public void run(ApplicationArguments args) {
        migrateMembers();
        migrateLibraries();
        migrateSubscriptions();
    }

    private void migrateMembers() {
        List<Member> members = memberRepository.findByPhotoDataIsNullAndPhotoIsNotNull();
        int migrated = 0;
        for (Member member : members) {
            StoredImage image = imageStorageService.readFromDisk(member.getPhoto());
            if (image == null) continue;
            member.setPhotoData(image.data());
            member.setPhotoContentType(image.contentType());
            member.setPhotoFileName(image.fileName());
            memberRepository.save(member);
            migrated++;
        }
        if (migrated > 0) {
            log.info("Migrated {} member photos from disk to database", migrated);
        }
    }

    private void migrateLibraries() {
        List<Library> libraries = libraryRepository.findByIconDataIsNullAndIconIsNotNull();
        int migrated = 0;
        for (Library library : libraries) {
            StoredImage image = imageStorageService.readFromDisk(library.getIcon());
            if (image == null) continue;
            library.setIconData(image.data());
            library.setIconContentType(image.contentType());
            library.setIconFileName(image.fileName());
            libraryRepository.save(library);
            migrated++;
        }
        if (migrated > 0) {
            log.info("Migrated {} library icons from disk to database", migrated);
        }
    }

    private void migrateSubscriptions() {
        List<Subscription> subscriptions = subscriptionRepository.findByScreenshotDataIsNullAndPaymentScreenshotIsNotNull();
        int migrated = 0;
        for (Subscription subscription : subscriptions) {
            StoredImage image = imageStorageService.readFromDisk(subscription.getPaymentScreenshot());
            if (image == null) continue;
            subscription.setScreenshotData(image.data());
            subscription.setScreenshotContentType(image.contentType());
            subscription.setScreenshotFileName(image.fileName());
            subscriptionRepository.save(subscription);
            migrated++;
        }
        if (migrated > 0) {
            log.info("Migrated {} subscription screenshots from disk to database", migrated);
        }
    }
}
