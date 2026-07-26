package com.lab.library.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "libraries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Library extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private UUID ownerId;

    private String address;

    private String phone;

    @Column(nullable = false)
    private boolean active = true;
}
