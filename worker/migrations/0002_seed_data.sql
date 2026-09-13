-- Seed Initial Data for Chalak Performance
-- Departments
INSERT OR IGNORE INTO departments (id, name, description) VALUES
('dept_prod', 'تولید و عملیات', 'خطوط اکستروژن و مونتاژ کارخانه'),
('dept_qc', 'کنترل کیفیت و آزمایشگاه', 'تضمین و بازرسی کیفیت محصولات'),
('dept_hse', 'ایمنی و بهداشت حرفه‌ای (HSE)', 'سلامت، ایمنی و محیط زیست'),
('dept_hr', 'منابع انسانی و اداری', 'توسعه شایستگی‌ها و جبران خدمت');

-- Default Admin User (Password: admin123, hash generated via WebCrypto)
INSERT OR IGNORE INTO users (id, name, username, email, password_hash, role, department_id, workspace_id, is_active) VALUES
('usr_admin', 'مدیر ارشد سیستم', 'admin', 'admin@chalak.ir', 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec', 'admin', 'dept_hr', 'default_org', 1),
('usr_supervisor', 'مهندس رضایی (سرپرست تولید)', 'supervisor', 'rezaei@chalak.ir', 'supervisor123', 'manager', 'dept_prod', 'default_org', 1),
('usr_hr', 'کارشناس توسعه منابع انسانی', 'hr', 'hr@chalak.ir', 'hr123', 'hr', 'dept_hr', 'default_org', 1),
('usr_emp1', 'علی اکبری (اپراتور خط ۱)', 'emp1', 'akbari@chalak.ir', 'emp123', 'employee', 'dept_prod', 'default_org', 1);

-- Core Criteria
INSERT OR IGNORE INTO criteria (id, code, title, category, description, min_score, max_score, is_mandatory, dir, scoring_source, mis_metric_key, calculation_type, target_value) VALUES
('crit-k1', 'K-01', 'تحقق برنامه تولید و راندمان', 'K', 'درصد تحقق تولید برنامه‌ریزی شده در سیستم WMS/MES', 1.0, 5.0, 0, 'more', 'mis', 'efficiency', 'ratio', 100),
('crit-k2', 'K-04', 'نرخ ضایعات و افت کیفی', 'K', 'درصد ضایعات تولیدی نسبت به کل قطعات تولیدی', 1.0, 5.0, 0, 'less', 'mis', 'scrap_rate', 'defect_rate', 2.0),
('crit-q1', 'Q-01', 'رعایت استانداردها و دستورالعمل‌های کنترل کیفیت', 'Q', 'انطباق قطعات تولیدی با تلرانس و چک‌لیست QC', 1.0, 5.0, 0, 'more', 'supervisor', NULL, 'direct_score', NULL),
('crit-b1', 'B-01', 'نظم، انضباط و حضور به‌موقع', 'B', 'میزان تاخیرات و غیبت بر اساس سامانه کسری', 1.0, 5.0, 0, 'less', 'kasra', 'attendance_delay', 'direct_score', NULL),
('crit-b2', 'B-03', 'همکاری تیمی و پاسخگویی سازمانی', 'B', 'هم‌افزایی با سایر همکاران خط و آمادگی در شیفت‌های فشرده', 1.0, 5.0, 0, 'more', 'supervisor', NULL, 'direct_score', NULL),
('crit-s1', 'S-01', 'رعایت الزامات ایمنی و حفاظت فردی (PPE)', 'S', 'استفاده مستمر از کلاه، دستکش، کفش ایمنی و رعایت ۵S', 1.0, 5.0, 1, 'more', 'supervisor', NULL, 'direct_score', NULL),
('crit-l1', 'L-01', 'توانایی حل مسئله و مربیگری خط', 'L', 'ارائه پیشنهاد بهبود (کایزن) و هدایت اپراتورهای تازه‌کار', 1.0, 5.0, 0, 'more', 'supervisor', NULL, 'direct_score', NULL);

-- Job Profiles
INSERT OR IGNORE INTO job_profiles (id, title, code, family, department_id, description, locked) VALUES
('prof-op1', 'اپراتور ارشد دستگاه اکسترودر', 'B1', 'تولید کارگاهی', 'dept_prod', 'مسئول تنظیم پارامترها و خط تولید لوله و اتصالات', 0),
('prof-qc1', 'بازرس کنترل کیفیت سالن', 'Q1', 'تضمین کیفیت', 'dept_qc', 'مسئول تست‌های آزمایشگاهی و بازرسی رندوم خط', 0);

-- Job Profile Criteria Weights
INSERT OR IGNORE INTO job_profile_criteria (id, job_profile_id, criterion_id, weight, target) VALUES
('jpc-1', 'prof-op1', 'crit-k1', 25.0, 100),
('jpc-2', 'prof-op1', 'crit-k2', 20.0, 1.5),
('jpc-3', 'prof-op1', 'crit-q1', 15.0, NULL),
('jpc-4', 'prof-op1', 'crit-b1', 15.0, NULL),
('jpc-5', 'prof-op1', 'crit-s1', 15.0, NULL),
('jpc-6', 'prof-op1', 'crit-b2', 10.0, NULL),

('jpc-7', 'prof-qc1', 'crit-q1', 30.0, NULL),
('jpc-8', 'prof-qc1', 'crit-k2', 20.0, NULL),
('jpc-9', 'prof-qc1', 'crit-b1', 15.0, NULL),
('jpc-10', 'prof-qc1', 'crit-s1', 20.0, NULL),
('jpc-11', 'prof-qc1', 'crit-b2', 15.0, NULL);

-- Employees
INSERT OR IGNORE INTO employees (id, personnel_code, first_name, last_name, job, unit, manager_id, user_id, department_id, profile_id) VALUES
('emp-101', 'EMP-1001', 'علی', 'اکبری', 'اپراتور ارشد اکسترودر', 'تولید خط ۱', NULL, 'usr_emp1', 'dept_prod', 'prof-op1'),
('emp-102', 'EMP-1002', 'محمد', 'کاظمی', 'اپراتور فرآیند تولید', 'تولید خط ۲', 'emp-101', NULL, 'dept_prod', 'prof-op1'),
('emp-103', 'EMP-1003', 'زهرا', 'حسینی', 'کارشناس کنترل کیفیت', 'آزمایشگاه کنترل کیفیت', NULL, NULL, 'dept_qc', 'prof-qc1');

-- Sample Evaluation
INSERT OR IGNORE INTO evaluations (
  id, employee_id, evaluator_id, profile_id, cycle, status, stage,
  total_score, performance_level, potential_level, nine_box_position, version
) VALUES (
  'eval-demo-01', 'emp-101', 'usr_admin', 'prof-op1', 'دوره بهار ۱۴۰۳', 'draft', 'supervisor_review',
  86.5, 'high', 'medium', 'high_performer', 1
);

INSERT OR IGNORE INTO evaluation_scores (
  id, evaluation_id, criterion_id, weight, self_score, manager_score, final_score, evidence
) VALUES
('es-demo-1', 'eval-demo-01', 'crit-k1', 25.0, 4.5, 4.5, 4.5, 'تحقق ۱۰۳٪ هدف تولید در گزارش ماهانه MES'),
('es-demo-2', 'eval-demo-01', 'crit-k2', 20.0, 4.0, 4.0, 4.0, 'کاهش ضایعات به ۱.۱٪ بر اساس تاییدیه انبار ضایعات'),
('es-demo-3', 'eval-demo-01', 'crit-q1', 15.0, 5.0, 4.5, 4.5, 'رعایت دقیق چک‌لیست‌های پنج‌گانه کیفی'),
('es-demo-4', 'eval-demo-01', 'crit-b1', 15.0, 4.0, 4.0, 4.0, 'بدون تاخیر غیرمجاز در گزارش کسری'),
('es-demo-5', 'eval-demo-01', 'crit-s1', 15.0, 5.0, 5.0, 5.0, 'رعایت کامل کلاه و کفش ایمنی و راهنمایی همکاران'),
('es-demo-6', 'eval-demo-01', 'crit-b2', 10.0, 4.0, 4.0, 4.0, 'حضور فعال در اضافه کاری روزهای تعطیل');
