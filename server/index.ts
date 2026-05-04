import express from 'express';
import cors from 'cors';
import { query } from './db';

const app = express();
app.use(cors());
app.use(express.json());

// GET: Fetch all parties from party_master
app.get('/api/parties', async (req, res) => {
    try {
        const sql = 'SELECT * FROM party_master ORDER BY created_at DESC';
        const result = await query(sql);

        // Map database columns back to the frontend Party interface
        const mappedParties = result.rows.map((row: any) => ({
            id: row.party_id,
            name: row.company_name,
            address: row.address || '',
            contact: row.contact_no || '',
            gstNo: row.gst_no || '',
            email: row.email || ''
        }));

        res.json(mappedParties);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch parties' });
    }
});

// POST: Add a new party into party_master
app.post('/api/parties', async (req, res) => {
    const {
        regNo, companyName, contactPerson, address, email, contact, gstNo,
        gstType, otherAccess, billingRateType, discountRate, collabMethod,
        reportingMethod, collationMethod, dispatchMethod, compliance,
        decisionRule, billingFirm
    } = req.body;

    if (!companyName) {
        return res.status(400).json({ error: 'Company Name is required' });
    }

    try {
        const sql = `
      INSERT INTO party_master (
        reg_no, company_name, contact_person, address, email, contact_no,
        gst_no, gst_type, other_access_to, billing_rate_type, discount_rate,
        calibration_method, reporting_method, collection_method,
        dispatch_method, compliance_statement, decision_rule, billing_firm
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
      RETURNING *
    `;

        const isDecisionRuleTrue = decisionRule === 'Yes';
        const parsedDiscount = discountRate ? parseFloat(discountRate) : null;

        const result = await query(sql, [
            regNo, companyName, contactPerson, address, email, contact,
            gstNo, gstType, otherAccess, billingRateType, parsedDiscount,
            collabMethod, reportingMethod, collationMethod, dispatchMethod,
            compliance, isDecisionRuleTrue, billingFirm
        ]);

        const row = result.rows[0];
        res.status(201).json({
            id: row.party_id,
            name: row.company_name,
            address: row.address,
            contact: row.contact_no,
            gstNo: row.gst_no,
            email: row.email
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register party' });
    }
});

// POST: Add a new gauge into gauge_master
app.post('/api/gauges', async (req, res) => {
    const {
        gaugeName, isStandardNo, nonNablCertFormatNo, nablCertFormatNo,
        rawDatasheetFormatNo, certificateCode, calibrationMethod, gaugeType,
        environmentalConditions
    } = req.body;

    if (!gaugeName) {
        return res.status(400).json({ error: 'Gauge Name is required' });
    }

    try {
        const sql = `
      INSERT INTO gauge_master (
        gauge_name, is_standard_no, non_nabl_cert_format_no, nabl_cert_format_no,
        raw_datasheet_format_no, certificate_code, calibration_method, gauge_type,
        environmental_conditions
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
      RETURNING *
    `;

        const result = await query(sql, [
            gaugeName, isStandardNo, nonNablCertFormatNo, nablCertFormatNo,
            rawDatasheetFormatNo, certificateCode, calibrationMethod, gaugeType,
            environmentalConditions
        ]);

        const row = result.rows[0];
        res.status(201).json({
            id: row.gauge_id,
            name: row.gauge_name,
            type: row.gauge_type,
            certificateCode: row.certificate_code
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register gauge' });
    }
});

// GET: Fetch all gauges from gauge_master
app.get('/api/gauges', async (req, res) => {
    try {
        const sql = 'SELECT * FROM gauge_master ORDER BY created_at DESC';
        const result = await query(sql);

        const mappedGauges = result.rows.map((row: any) => ({
            id: row.gauge_id,
            name: row.gauge_name,
            type: row.gauge_type,
            certificateCode: row.certificate_code,
            isStandardNo: row.is_standard_no,
            calibrationMethod: row.calibration_method
        }));

        res.json(mappedGauges);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch gauges' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend API resolving to Table: party_master & gauge_master running on http://localhost:${PORT}`);
});
