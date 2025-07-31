package routes

import (
	"agendamento-backend/internal/application/usecases"
	"agendamento-backend/internal/interfaces/http/handlers"
	"agendamento-backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

// SetupBookingRoutes configura as rotas de agendamentos
func SetupBookingRoutes(router *gin.RouterGroup, bookingHandler *handlers.BookingHandler, userUseCase *usecases.UserUseCase) {
	bookings := router.Group("/bookings")
	bookings.Use(middleware.AuthMiddleware(userUseCase)) // Requer autenticação
	{
		// Criar agendamento
		bookings.POST("", bookingHandler.CreateBooking)

		// Buscar agendamento por ID
		bookings.GET("/:id", bookingHandler.GetBooking)

		// Atualizar agendamento
		bookings.PUT("/:id", bookingHandler.UpdateBooking)

		// Listar agendamentos (com filtros)
		bookings.GET("", bookingHandler.ListBookings)

		// Buscar meus agendamentos (usuário logado)
		bookings.GET("/my", bookingHandler.GetMyBookings)

		// Buscar agendamentos de um usuário específico (admin/atendente)
		bookings.GET("/user/:user_id", bookingHandler.GetUserBookings)

		// Buscar agendamentos de hoje
		bookings.GET("/today", bookingHandler.GetTodayBookings)

		// Buscar próximos agendamentos
		bookings.GET("/upcoming", bookingHandler.GetUpcomingBookings)

		// Buscar estatísticas de agendamentos
		bookings.GET("/stats", bookingHandler.GetBookingStats)

		// Buscar agendamentos de uma cadeira
		bookings.GET("/chair/:chair_id", bookingHandler.GetChairBookings)

		// Buscar agendamentos por data
		bookings.GET("/date/:date", bookingHandler.GetBookingsByDate)

		// Buscar agendamentos por data (incluindo passado)
		bookings.GET("/date/:date/past", bookingHandler.GetBookingsByDateIncludingPast)

		// Buscar agendamentos de uma cadeira por data
		bookings.GET("/chair/:chair_id/date/:date", bookingHandler.GetChairBookingsByDate)

		// Reagendar agendamento
		bookings.PUT("/:id/reschedule", bookingHandler.RescheduleBooking)

		// Cancelar agendamento
		bookings.PATCH("/:id/cancel", bookingHandler.CancelBooking)

		// Marcar presença
		bookings.POST("/:id/attendance", bookingHandler.MarkAttendance)

		// Marcar como falta
		bookings.POST("/:id/no-show", bookingHandler.MarkAsNoShow)

		// Completar agendamento
		bookings.POST("/:id/complete", bookingHandler.CompleteBooking)

		// Buscar estatísticas do sistema (admin)
		bookings.GET("/system-stats", bookingHandler.GetSystemStats)

		// Buscar estatísticas do atendente
		bookings.GET("/attendant-stats", bookingHandler.GetAttendantStats)

		// Buscar estatísticas do usuário
		bookings.GET("/user-stats", bookingHandler.GetUserStats)

		// Buscar opções de reagendamento
		bookings.GET("/:id/reschedule-options", bookingHandler.GetRescheduleOptions)

		// Reagendar com data/hora específica
		bookings.PUT("/:id/reschedule-datetime", bookingHandler.RescheduleBookingDateTime)
	}
}
