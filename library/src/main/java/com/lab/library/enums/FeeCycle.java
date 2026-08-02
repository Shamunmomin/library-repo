package com.lab.library.enums;

public enum FeeCycle {
    MONTHLY(1),
    QUARTERLY(3),
    HALF_YEARLY(6),
    YEARLY(12);

    private final int months;

    FeeCycle(int months) {
        this.months = months;
    }

    public int getMonths() {
        return months;
    }
}
