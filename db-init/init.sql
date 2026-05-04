CREATE TABLE gauge_master (
    gauge_id BIGSERIAL PRIMARY KEY,
    gauge_name VARCHAR(150) NOT NULL,
    is_standard_no VARCHAR(50),
    non_nabl_cert_format_no VARCHAR(100),
    nabl_cert_format_no VARCHAR(100),
    raw_datasheet_format_no VARCHAR(100),
    certificate_code VARCHAR(50),
    calibration_method VARCHAR(100),
    gauge_type VARCHAR(100),
    environmental_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE party_master (
    party_id BIGSERIAL PRIMARY KEY,
    reg_no VARCHAR(50),
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    address TEXT,
    email VARCHAR(150),
    contact_no VARCHAR(20),
    gst_no VARCHAR(30),
    gst_type VARCHAR(30),
    other_access_to VARCHAR(100),
    billing_rate_type VARCHAR(100),
    discount_rate NUMERIC(5,2),
    calibration_method VARCHAR(100),
    reporting_method VARCHAR(100),
    collection_method VARCHAR(100),
    dispatch_method VARCHAR(100),
    compliance_statement VARCHAR(100),
    decision_rule BOOLEAN,
    billing_firm VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inward_master (
    inward_id BIGSERIAL PRIMARY KEY,
    party_id BIGINT NOT NULL,
    client_dc_no VARCHAR(50),
    client_dc_date DATE,
    inward_date DATE NOT NULL,
    receive_date DATE,
    commit_date DATE,
    through_mode VARCHAR(100),
    calibration_method VARCHAR(100),
    reporting_method VARCHAR(100),
    collection_mode VARCHAR(100),
    dispatch_mode VARCHAR(100),
    compliance_statement VARCHAR(100),
    decision_rule BOOLEAN,
    specific_requirement TEXT,
    lab_authorized_person VARCHAR(100),
    designation VARCHAR(100),
    customer_authorized_person VARCHAR(100),
    contact_no VARCHAR(20),
    billing_firm VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inward_party
        FOREIGN KEY (party_id)
        REFERENCES party_master(party_id)
);

CREATE TABLE inward_gauge (
    inward_gauge_id BIGSERIAL PRIMARY KEY,
    inward_id BIGINT NOT NULL,
    gauge_id BIGINT NOT NULL,
    class_name VARCHAR(100),
    identification_no VARCHAR(100),
    calibration_frequency VARCHAR(100),
    make_name VARCHAR(100),
    manufacturing_sr_no VARCHAR(100),
    process_name VARCHAR(100),
    unit_name VARCHAR(50),
    calibration_location VARCHAR(100),
    calibration_under VARCHAR(100),
    gauge_condition VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_inward
        FOREIGN KEY (inward_id)
        REFERENCES inward_master(inward_id),
    CONSTRAINT fk_item_gauge
        FOREIGN KEY (gauge_id)
        REFERENCES gauge_master(gauge_id)
);
