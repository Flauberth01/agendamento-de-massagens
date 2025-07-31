package usecases

import (
	"testing"
	"time"

	"agendamento-backend/internal/domain/entities"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockUserRepository é um mock do repositório de usuários
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(user *entities.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) GetByID(id uint) (*entities.User, error) {
	args := m.Called(id)
	return args.Get(0).(*entities.User), args.Error(1)
}

func (m *MockUserRepository) GetByEmail(email string) (*entities.User, error) {
	args := m.Called(email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.User), args.Error(1)
}

func (m *MockUserRepository) GetByCPF(cpf string) (*entities.User, error) {
	args := m.Called(cpf)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.User), args.Error(1)
}

func (m *MockUserRepository) Update(user *entities.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) Delete(id uint) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockUserRepository) List(limit, offset int, filters map[string]interface{}) ([]*entities.User, int64, error) {
	args := m.Called(limit, offset, filters)
	return args.Get(0).([]*entities.User), args.Get(1).(int64), args.Error(2)
}

func (m *MockUserRepository) GetPendingApprovals(limit, offset int) ([]*entities.User, int64, error) {
	args := m.Called(limit, offset)
	return args.Get(0).([]*entities.User), args.Get(1).(int64), args.Error(2)
}

func (m *MockUserRepository) GetByRole(role string, limit, offset int) ([]*entities.User, int64, error) {
	args := m.Called(role, limit, offset)
	return args.Get(0).([]*entities.User), args.Get(1).(int64), args.Error(2)
}

func (m *MockUserRepository) GetByStatus(status string, limit, offset int) ([]*entities.User, int64, error) {
	args := m.Called(status, limit, offset)
	return args.Get(0).([]*entities.User), args.Get(1).(int64), args.Error(2)
}

func (m *MockUserRepository) Approve(id uint, approvedBy uint) error {
	args := m.Called(id, approvedBy)
	return args.Error(0)
}

func (m *MockUserRepository) Reject(id uint, rejectedBy uint, reason string) error {
	args := m.Called(id, rejectedBy, reason)
	return args.Error(0)
}

func (m *MockUserRepository) ChangeRole(id uint, newRole string, changedBy uint) error {
	args := m.Called(id, newRole, changedBy)
	return args.Error(0)
}

func (m *MockUserRepository) ChangeStatus(id uint, newStatus string, changedBy uint) error {
	args := m.Called(id, newStatus, changedBy)
	return args.Error(0)
}

func (m *MockUserRepository) UpdateLastLogin(id uint) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockUserRepository) ExistsByEmail(email string) (bool, error) {
	args := m.Called(email)
	return args.Bool(0), args.Error(1)
}

func (m *MockUserRepository) ExistsByCPF(cpf string) (bool, error) {
	args := m.Called(cpf)
	return args.Bool(0), args.Error(1)
}

func (m *MockUserRepository) ExistsByPhone(phone string) (bool, error) {
	args := m.Called(phone)
	return args.Bool(0), args.Error(1)
}

func (m *MockUserRepository) CountByRole(role string) (int64, error) {
	args := m.Called(role)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockUserRepository) CountByStatus(status string) (int64, error) {
	args := m.Called(status)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockUserRepository) CountTotal() (int64, error) {
	args := m.Called()
	return args.Get(0).(int64), args.Error(1)
}

// MockAuditLogRepository é um mock do repositório de auditoria
type MockAuditLogRepository struct {
	mock.Mock
}

func (m *MockAuditLogRepository) Create(auditLog *entities.AuditLog) error {
	args := m.Called(auditLog)
	return args.Error(0)
}

func (m *MockAuditLogRepository) GetByID(id uint) (*entities.AuditLog, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.AuditLog), args.Error(1)
}

func (m *MockAuditLogRepository) List(limit, offset int, filters map[string]interface{}) ([]*entities.AuditLog, int64, error) {
	args := m.Called(limit, offset, filters)
	return args.Get(0).([]*entities.AuditLog), args.Get(1).(int64), args.Error(2)
}

func (m *MockAuditLogRepository) GetByUser(userID uint, limit, offset int) ([]*entities.AuditLog, int64, error) {
	args := m.Called(userID, limit, offset)
	return args.Get(0).([]*entities.AuditLog), args.Get(1).(int64), args.Error(2)
}

func (m *MockAuditLogRepository) GetByAction(action string, limit, offset int) ([]*entities.AuditLog, int64, error) {
	args := m.Called(action, limit, offset)
	return args.Get(0).([]*entities.AuditLog), args.Get(1).(int64), args.Error(2)
}

func (m *MockAuditLogRepository) GetByResource(resource string, limit, offset int) ([]*entities.AuditLog, int64, error) {
	args := m.Called(resource, limit, offset)
	return args.Get(0).([]*entities.AuditLog), args.Get(1).(int64), args.Error(2)
}

func (m *MockAuditLogRepository) GetByResourceID(resource string, resourceID uint, limit, offset int) ([]*entities.AuditLog, int64, error) {
	args := m.Called(resource, resourceID, limit, offset)
	return args.Get(0).([]*entities.AuditLog), args.Get(1).(int64), args.Error(2)
}

func (m *MockAuditLogRepository) GetByDateRange(startDate, endDate time.Time, limit, offset int) ([]*entities.AuditLog, int64, error) {
	args := m.Called(startDate, endDate, limit, offset)
	return args.Get(0).([]*entities.AuditLog), args.Get(1).(int64), args.Error(2)
}

func (m *MockAuditLogRepository) GetRecentActivity(limit int) ([]*entities.AuditLog, error) {
	args := m.Called(limit)
	return args.Get(0).([]*entities.AuditLog), args.Error(1)
}

func (m *MockAuditLogRepository) GetUserActivity(userID uint, limit int) ([]*entities.AuditLog, error) {
	args := m.Called(userID, limit)
	return args.Get(0).([]*entities.AuditLog), args.Error(1)
}

func (m *MockAuditLogRepository) GetSystemActivity(limit int) ([]*entities.AuditLog, error) {
	args := m.Called(limit)
	return args.Get(0).([]*entities.AuditLog), args.Error(1)
}

func (m *MockAuditLogRepository) GetActivityByPeriod(startDate, endDate time.Time) ([]*entities.AuditLog, error) {
	args := m.Called(startDate, endDate)
	return args.Get(0).([]*entities.AuditLog), args.Error(1)
}

func (m *MockAuditLogRepository) GetMostActiveUsers(limit int, startDate, endDate time.Time) ([]map[string]interface{}, error) {
	args := m.Called(limit, startDate, endDate)
	return args.Get(0).([]map[string]interface{}), args.Error(1)
}

func (m *MockAuditLogRepository) GetMostCommonActions(limit int, startDate, endDate time.Time) ([]map[string]interface{}, error) {
	args := m.Called(limit, startDate, endDate)
	return args.Get(0).([]map[string]interface{}), args.Error(1)
}

func (m *MockAuditLogRepository) CountByAction(action string) (int64, error) {
	args := m.Called(action)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockAuditLogRepository) CountByResource(resource string) (int64, error) {
	args := m.Called(resource)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockAuditLogRepository) CountByUser(userID uint) (int64, error) {
	args := m.Called(userID)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockAuditLogRepository) CountByDateRange(startDate, endDate time.Time) (int64, error) {
	args := m.Called(startDate, endDate)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockAuditLogRepository) CountTotal() (int64, error) {
	args := m.Called()
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockAuditLogRepository) DeleteOlderThan(date time.Time) error {
	args := m.Called(date)
	return args.Error(0)
}

func (m *MockAuditLogRepository) CleanupOldLogs(retentionDays int) error {
	args := m.Called(retentionDays)
	return args.Error(0)
}

// MockNotificationService é um mock do serviço de notificação
type MockNotificationService struct {
	mock.Mock
}

func (m *MockNotificationService) SendEmail(to, subject, body string) error {
	args := m.Called(to, subject, body)
	return args.Error(0)
}

func (m *MockNotificationService) SendUserApproval(user interface{}) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockNotificationService) SendUserRejection(user interface{}, reason string) error {
	args := m.Called(user, reason)
	return args.Error(0)
}

func (m *MockNotificationService) SendBookingConfirmation(booking interface{}) error {
	args := m.Called(booking)
	return args.Error(0)
}

func (m *MockNotificationService) SendBookingCancellation(booking interface{}) error {
	args := m.Called(booking)
	return args.Error(0)
}

func (m *MockNotificationService) SendBookingReminder(booking interface{}) error {
	args := m.Called(booking)
	return args.Error(0)
}

func (m *MockNotificationService) SendRoleChangeNotification(user interface{}, newRole string) error {
	args := m.Called(user, newRole)
	return args.Error(0)
}

// MockPasswordHasher é um mock do hasher de senhas
type MockPasswordHasher struct {
	mock.Mock
}

func (m *MockPasswordHasher) Hash(password string) (string, error) {
	args := m.Called(password)
	return args.String(0), args.Error(1)
}

func (m *MockPasswordHasher) Compare(hashedPassword, password string) error {
	args := m.Called(hashedPassword, password)
	return args.Error(0)
}

// MockValidator é um mock do validador
type MockValidator struct {
	mock.Mock
}

func (m *MockValidator) ValidateStruct(s interface{}) error {
	args := m.Called(s)
	return args.Error(0)
}

func (m *MockValidator) ValidateField(field interface{}, tag string) error {
	args := m.Called(field, tag)
	return args.Error(0)
}

// MockLogger é um mock do logger
type MockLogger struct {
	mock.Mock
}

func (m *MockLogger) Debug(message string, fields ...map[string]interface{}) {
	m.Called(message, fields)
}

func (m *MockLogger) Info(message string, fields ...map[string]interface{}) {
	m.Called(message, fields)
}

func (m *MockLogger) Warn(message string, fields ...map[string]interface{}) {
	m.Called(message, fields)
}

func (m *MockLogger) Error(message string, err error, fields ...map[string]interface{}) {
	m.Called(message, err, fields)
}

func (m *MockLogger) Fatal(message string, err error, fields ...map[string]interface{}) {
	m.Called(message, err, fields)
}

// MockTimeService é um mock do serviço de tempo
type MockTimeService struct {
	mock.Mock
}

func (m *MockTimeService) Now() time.Time {
	args := m.Called()
	return args.Get(0).(time.Time)
}

func (m *MockTimeService) ParseTime(layout, value string) (time.Time, error) {
	args := m.Called(layout, value)
	return args.Get(0).(time.Time), args.Error(1)
}

func (m *MockTimeService) FormatTime(t time.Time, layout string) string {
	args := m.Called(t, layout)
	return args.String(0)
}

func (m *MockTimeService) AddDuration(t time.Time, duration time.Duration) time.Time {
	args := m.Called(t, duration)
	return args.Get(0).(time.Time)
}

func (m *MockTimeService) IsWeekend(t time.Time) bool {
	args := m.Called(t)
	return args.Bool(0)
}

func (m *MockTimeService) IsBusinessDay(t time.Time) bool {
	args := m.Called(t)
	return args.Bool(0)
}

func TestUserUseCase_CreateUser_Success(t *testing.T) {
	// Arrange
	mockUserRepo := new(MockUserRepository)
	mockAuditRepo := new(MockAuditLogRepository)
	mockNotificationRepo := new(MockNotificationService)
	mockPasswordHasher := new(MockPasswordHasher)
	mockValidator := new(MockValidator)
	mockLogger := new(MockLogger)
	mockTimeService := new(MockTimeService)

	userUseCase := NewUserUseCase(
		mockUserRepo,
		mockAuditRepo,
		mockNotificationRepo,
		mockPasswordHasher,
		mockValidator,
		mockLogger,
		mockTimeService,
	)

	user := &entities.User{
		Name:     "João Silva",
		CPF:      "12345678909",
		Email:    "joao@example.com",
		Phone:    "11999999999",
		Password: "123456",
		Gender:   "masculino",
	}
	user.SetDefaultValues()

	createdBy := uint(1)

	// Expectations
	mockValidator.On("ValidateStruct", user).Return(nil)
	mockUserRepo.On("ExistsByEmail", user.Email).Return(false, nil)
	mockUserRepo.On("ExistsByCPF", user.CPF).Return(false, nil)
	mockPasswordHasher.On("Hash", user.Password).Return("hashed_password", nil)
	mockUserRepo.On("Create", mock.AnythingOfType("*entities.User")).Return(nil)
	mockAuditRepo.On("Create", mock.AnythingOfType("*entities.AuditLog")).Return(nil)
	mockLogger.On("Info", mock.AnythingOfType("string"), mock.AnythingOfType("[]map[string]interface {}")).Return()
	mockLogger.On("Info", mock.AnythingOfType("string"), mock.AnythingOfType("[]map[string]interface {}")).Return()

	// Act
	err := userUseCase.CreateUser(user, &createdBy)

	// Assert
	assert.NoError(t, err)
	mockUserRepo.AssertExpectations(t)
	mockAuditRepo.AssertExpectations(t)
	mockValidator.AssertExpectations(t)
	mockPasswordHasher.AssertExpectations(t)
}

func TestUserUseCase_CreateUser_EmailAlreadyExists(t *testing.T) {
	// Arrange
	mockUserRepo := new(MockUserRepository)
	mockAuditRepo := new(MockAuditLogRepository)
	mockNotificationRepo := new(MockNotificationService)
	mockPasswordHasher := new(MockPasswordHasher)
	mockValidator := new(MockValidator)
	mockLogger := new(MockLogger)
	mockTimeService := new(MockTimeService)

	userUseCase := NewUserUseCase(
		mockUserRepo,
		mockAuditRepo,
		mockNotificationRepo,
		mockPasswordHasher,
		mockValidator,
		mockLogger,
		mockTimeService,
	)

	user := &entities.User{
		Name:     "João Silva",
		CPF:      "12345678909",
		Email:    "joao@example.com",
		Phone:    "11999999999",
		Password: "123456",
		Gender:   "masculino",
	}
	user.SetDefaultValues()

	createdBy := uint(1)

	// Expectations
	mockValidator.On("ValidateStruct", user).Return(nil)
	mockUserRepo.On("ExistsByEmail", user.Email).Return(true, nil)
	mockLogger.On("Info", mock.AnythingOfType("string"), mock.AnythingOfType("[]map[string]interface {}")).Return()
	mockLogger.On("Warn", mock.AnythingOfType("string"), mock.AnythingOfType("[]map[string]interface {}")).Return()

	// Act
	err := userUseCase.CreateUser(user, &createdBy)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "email já está em uso")
	mockUserRepo.AssertExpectations(t)
}

func TestUserUseCase_GetUserByID_Success(t *testing.T) {
	// Arrange
	mockUserRepo := new(MockUserRepository)
	mockAuditRepo := new(MockAuditLogRepository)
	mockNotificationRepo := new(MockNotificationService)
	mockPasswordHasher := new(MockPasswordHasher)
	mockValidator := new(MockValidator)
	mockLogger := new(MockLogger)
	mockTimeService := new(MockTimeService)

	userUseCase := NewUserUseCase(
		mockUserRepo,
		mockAuditRepo,
		mockNotificationRepo,
		mockPasswordHasher,
		mockValidator,
		mockLogger,
		mockTimeService,
	)

	expectedUser := &entities.User{
		ID:    1,
		Name:  "João Silva",
		Email: "joao@example.com",
	}

	// Expectations
	mockUserRepo.On("GetByID", uint(1)).Return(expectedUser, nil)

	// Act
	user, err := userUseCase.GetUserByID(1)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, expectedUser, user)
	mockUserRepo.AssertExpectations(t)
}

func TestUserUseCase_GetUserByID_NotFound(t *testing.T) {
	// Arrange
	mockUserRepo := new(MockUserRepository)
	mockAuditRepo := new(MockAuditLogRepository)
	mockNotificationRepo := new(MockNotificationService)
	mockPasswordHasher := new(MockPasswordHasher)
	mockValidator := new(MockValidator)
	mockLogger := new(MockLogger)
	mockTimeService := new(MockTimeService)

	userUseCase := NewUserUseCase(
		mockUserRepo,
		mockAuditRepo,
		mockNotificationRepo,
		mockPasswordHasher,
		mockValidator,
		mockLogger,
		mockTimeService,
	)

	// Expectations
	mockUserRepo.On("GetByID", uint(1)).Return((*entities.User)(nil), assert.AnError)

	// Act
	user, err := userUseCase.GetUserByID(1)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, user)
	mockUserRepo.AssertExpectations(t)
}
